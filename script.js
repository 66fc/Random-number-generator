let isRolling = false;
let rollInterval;
let probabilities = {};
let activeNumbers = {}; // 存储号码是否参与摇号

// 添加键盘事件监听
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "h") {
    e.preventDefault(); // 阻止默认的行为
    toggleProbabilityPanel();
  }
});

// 切换概率设置面板
function toggleProbabilityPanel() {
  const panel = document.getElementById("probabilityPanel");
  const overlay = document.getElementById("overlay");
  const isHidden = panel.style.display === "none";

  if (isHidden) {
    updateProbabilityPanel();
    panel.style.display = "block";
    overlay.style.display = "block";
  } else {
    panel.style.display = "none";
    overlay.style.display = "none";
  }
}

// 添加点击遮罩层关闭面板的功能
document.getElementById("overlay").addEventListener("click", function (e) {
  if (e.target === this) {
    toggleProbabilityPanel();
  }
});

// 全选/全不选功能
function selectAll(value) {
  const inputs = document.querySelectorAll(
    '.probability-item input[type="checkbox"]'
  );
  inputs.forEach((input) => {
    input.checked = value;
    const numValue = parseInt(input.dataset.number);
    activeNumbers[numValue] = value;
    input.parentElement.classList.toggle("active", value);
  });
}

// 更新概率设置面板
function updateProbabilityPanel() {
  const minNum = parseInt(document.getElementById("minNum").value);
  const maxNum = parseInt(document.getElementById("maxNum").value);

  document.getElementById("numberRange").textContent = `${minNum} - ${maxNum}`;

  const container = document.getElementById("probabilityInputs");
  container.innerHTML = "";

  for (let i = minNum; i <= maxNum; i++) {
    const div = document.createElement("div");
    div.className = `probability-item ${
      activeNumbers[i] !== false ? "active" : ""
    }`;

    // 添加复选框
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = activeNumbers[i] !== false;
    checkbox.dataset.number = i;
    checkbox.onchange = () => {
      activeNumbers[i] = checkbox.checked;
      div.classList.toggle("active", checkbox.checked);
    };

    const label = document.createElement("label");
    label.textContent = `${i}:`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "100";
    input.value = probabilities[i] || 1;
    input.onchange = () => (probabilities[i] = parseFloat(input.value) || 1);

    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(input);
    container.appendChild(div);
  }
}

// 修改随机数生成函数，考虑是否参与摇号
function getRandomNum(min, max, excludeNumbers = []) {
  let numbers = [];
  let weights = [];

  for (let i = min; i <= max; i++) {
    // 只有选中参与摇号的数字才会被添加到候选列表
    if (!excludeNumbers.includes(i) && activeNumbers[i] !== false) {
      numbers.push(i);
      weights.push(probabilities[i] || 1);
    }
  }

  if (numbers.length === 0) {
    alert("没有可用的号码！请在设置中选择参与摇号的号码。");
    return null;
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return numbers[i];
    }
  }

  return numbers[numbers.length - 1];
}

function startRoll() {
  const minNum = parseInt(document.getElementById("minNum").value);
  const maxNum = parseInt(document.getElementById("maxNum").value);
  const count = parseInt(document.getElementById("count").value);

  if (minNum >= maxNum) {
    alert("最小值必须小于最大值！");
    return;
  }

  if (count > maxNum - minNum + 1) {
    alert("抽取数量不能大于数字范围！");
    return;
  }

  const startButton = document.querySelector(".button-group button");

  if (!isRolling) {
    // 开始摇号
    isRolling = true;
    startButton.textContent = "停止";

    let selectedNumbers = [];

    rollInterval = setInterval(() => {
      const randomNum = getRandomNum(minNum, maxNum, selectedNumbers);
      if (randomNum === null) {
        clearInterval(rollInterval);
        isRolling = false;
        startButton.textContent = "开始摇号";
        return;
      }
      document.getElementById("result").textContent = randomNum;
    }, 50);

    setTimeout(() => {
      if (isRolling) {
        clearInterval(rollInterval);
        selectedNumbers = [];

        // 生成最终结果
        for (let i = 0; i < count; i++) {
          const finalNum = getRandomNum(minNum, maxNum, selectedNumbers);
          selectedNumbers.push(finalNum);
        }

        document.getElementById("result").innerHTML = selectedNumbers
          .map((num) => `<span class="number">${num}</span>`)
          .join(",");
        isRolling = false;
        startButton.textContent = "开始摇号";
      }
    }, 1000);
  } else {
    // 停止摇号
    isRolling = false;
    startButton.textContent = "开始摇号";
    clearInterval(rollInterval);
  }
}
