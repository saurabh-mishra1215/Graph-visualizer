const gridContainer = document.getElementById('grid-container');
const algorithmSelect = document.getElementById('algorithm-select');
const runButton = document.getElementById('run-button');
const gridSizeInput = document.getElementById('grid-size');
const speedInput = document.getElementById('speed');
const alert = document.getElementById('alert');

let grid = [];
let startNode = null;
let endNode = null;
let blockedNodes = new Set();
let algorithm = null;
let isRunning = false;

const previous = new Map();

const resetButton = document.getElementById('reset-button');

resetButton.addEventListener('click', () => {
    location.reload();
});

function createGrid(size) {
  gridContainer.innerHTML = '';
  grid = [];
  for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
          const node = document.createElement('div');
          node.className = 'node';
          node.setAttribute('data-row', i);
          node.setAttribute('data-col', j);
          gridContainer.appendChild(node);
          row.push(node);
      }
      grid.push(row);
  }
}

function initialize() {
    const size = parseInt(gridSizeInput.value);
    gridContainer.style.setProperty('--grid-size', size); 
    createGrid(size);

    gridContainer.removeEventListener('click', handleNodeClick);
    gridContainer.addEventListener('click', handleNodeClick);
}


function handleNodeClick(event) {
    const node = event.target;
    const row = parseInt(node.getAttribute('data-row'));
    const col = parseInt(node.getAttribute('data-col'));

    if (isRunning) return;

    if (!startNode) {
        startNode = { row, col };
        node.classList.add('start');
    } else if (!endNode) {
        endNode = { row, col };
        node.classList.add('end');
    } else {
        if (node.classList.contains('start')) startNode = null;
        if (node.classList.contains('end')) endNode = null;
        const nodeId = `${row}-${col}`;
        if (blockedNodes.has(nodeId)) {
            blockedNodes.delete(nodeId);
            node.classList.remove('blocked');
        } else {
            blockedNodes.add(nodeId);
            node.classList.add('blocked');
        }
    }
}

async function depthFirstSearch(grid, row, col, endNode, blockedNodes, speed) {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return false;
  }

  if (row === endNode.row && col === endNode.col) {
      return true;
  }

  if (blockedNodes.has(`${row}-${col}`)) {
      return false;
  }

  if (grid[row][col].classList.contains('visited')) {
      return false;
  }

  grid[row][col].classList.add('visited');


  await new Promise(resolve => setTimeout(resolve, speed));

  if (!grid[row][col].classList.contains('visited')) {
    grid[row][col].classList.add('visited');
    await new Promise(resolve => setTimeout(resolve, speed));
  }

  const neighbors = [
      [row - 1, col],
      [row, col + 1],
      [row + 1, col],
      [row, col - 1]
  ];

  for (const neighbor of neighbors) {
      const [neighborRow, neighborCol] = neighbor;
      if (await depthFirstSearch(grid, neighborRow, neighborCol, endNode, blockedNodes, speed)) {
          return true;
      }
  }

  return false;
}

async function dfsAlgorithm(grid, startNode, endNode, blockedNodes, speed) {
  await depthFirstSearch(grid, startNode.row, startNode.col, endNode, blockedNodes, speed);
}

async function bfs(grid, startNode, endNode, blockedNodes, speed) {
  const queue = [];
  const visited = new Set();

  queue.push({ row: startNode.row, col: startNode.col, distance: 0 });

  while (queue.length > 0) {
      const { row, col, distance } = queue.shift();

      if (row === endNode.row && col === endNode.col) {
          return true;
      }

      if (visited.has(`${row}-${col}`) || blockedNodes.has(`${row}-${col}`)) {
          continue;
      }

      visited.add(`${row}-${col}`);
      grid[row][col].classList.add('visited');

      // Wait for a certain amount of time to control visualization speed
      await new Promise(resolve => setTimeout(resolve, speed));

      const neighbors = [
          [row - 1, col],
          [row, col + 1],
          [row + 1, col],
          [row, col - 1]
      ];

      for (const [neighborRow, neighborCol] of neighbors) {
          if (
              neighborRow >= 0 &&
              neighborRow < grid.length &&
              neighborCol >= 0 &&
              neighborCol < grid[0].length &&
              !visited.has(`${neighborRow}-${neighborCol}`)
          ) {
              queue.push({ row: neighborRow, col: neighborCol, distance: distance + 1 });
          }
      }
  }

  return false;
}

async function bfsAlgorithm(grid, startNode, endNode, blockedNodes, speed) {
  await bfs(grid, startNode, endNode, blockedNodes, speed);
}

async function dijkstra(grid, startNode, endNode, blockedNodes, speed) {
  const distance = new Map();
  const queue = [];

  for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
          distance.set(`${row}-${col}`, Infinity);
          previous.set(`${row}-${col}`, null);
          queue.push({ row, col });
      }
  }

  distance.set(`${startNode.row}-${startNode.col}`, 0);

  while (queue.length > 0) {
      queue.sort((a, b) => distance.get(`${a.row}-${a.col}`) - distance.get(`${b.row}-${b.col}`));
      const { row, col } = queue.shift();

      if (blockedNodes.has(`${row}-${col}`)) {
          continue;
      }

      grid[row][col].classList.add('visited');

      await new Promise(resolve => setTimeout(resolve, speed));

      const neighbors = [
          [row - 1, col],
          [row, col + 1],
          [row + 1, col],
          [row, col - 1]
      ];

      for (const [neighborRow, neighborCol] of neighbors) {
          if (
              neighborRow >= 0 &&
              neighborRow < grid.length &&
              neighborCol >= 0 &&
              neighborCol < grid[0].length
          ) {
              const alt = distance.get(`${row}-${col}`) + 1;
              if (alt < distance.get(`${neighborRow}-${neighborCol}`)) {
                  distance.set(`${neighborRow}-${neighborCol}`, alt);
                  previous.set(`${neighborRow}-${neighborCol}`, { row, col });
              }
          }
      }
  }

  let current = endNode;
  while (current && current.row !== startNode.row && current.col !== startNode.col) {
      const { row, col } = current;
      grid[row][col].classList.add('shortest-path');
      current = previous.get(`${row}-${col}`);
  }

  await printShortestPath(grid, startNode, endNode);
}

async function dijkstraAlgorithm(grid, startNode, endNode, blockedNodes, speed) {
  await dijkstra(grid, startNode, endNode, blockedNodes, speed);
}

async function printShortestPath(grid, startNode, endNode) {
  let current = endNode;
  while (current && !(current.row === startNode.row && current.col === startNode.col)) {
      if (current === startNode && current === endNode)
          continue;
      const { row, col } = current;
      grid[row][col].classList.remove('visited');
      grid[row][col].classList.add('shortest-path');
      await new Promise(resolve => setTimeout(resolve, 50)); 
      current = previous.get(`${row}-${col}`);
  }
}

function throwError(HTMLElement, kind, text) {
  if (kind === "danger") {
    HTMLElement.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;
  }
}

function runAlgorithm() {
  if (!startNode) {
    throwError(alert, "danger", "<strong>No start node found!</strong> Where will you start huh?");
    return;
  }

  if (!endNode) {
    throwError(alert, "danger", "<strong>No end node found!</strong> Where will you End huh?");
    return;
  }

  if (isRunning) return;
  isRunning = true;

  const selectedAlgorithm = algorithmSelect.value;
  const speed = 100 - speedInput.value;

  switch (selectedAlgorithm) {

      case 'dfs':
          dfsAlgorithm(grid, startNode, endNode, blockedNodes, speed)
              .then(() => {
                  isRunning = false;
              })
              .catch(error => {
                  console.error('Error running DFS algorithm:', error);
                  isRunning = false;
              });
          break;
      case 'bfs':
          bfsAlgorithm(grid, startNode, endNode, blockedNodes, speed)
              .then(() => {
                  isRunning = false;
              })
              .catch(error => {
                  console.error('Error running BFS algorithm:', error);
                  isRunning = false;
              });
          break;
      case 'dijkstra':
          dijkstraAlgorithm(grid, startNode, endNode, blockedNodes, speed)
              .then(() => {
                  isRunning = false;
              })
              .catch(error => {
                  console.error('Error running Dijkstra\'s algorithm:', error);
                  isRunning = false;
              });
          break;
      default:
          console.error('Selected algorithm not implemented yet.');
          isRunning = false;
  }
}

runButton.addEventListener('click', runAlgorithm);
gridSizeInput.addEventListener('change', initialize);

initialize();
