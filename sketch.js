let stopSprite; // 宣告角色1站立動畫的精靈圖變數
let runSprite; // 宣告角色1跑步動畫的精靈圖變數
let character2StopSprite; // 宣告角色2站立圖片變數
let character2AttackSprite; // 宣告角色2攻擊動畫的精靈圖變數
let character2KickSprite; // 宣告角色2踢擊動畫的精靈圖變數
let playerX; // 宣告角色1在畫布上的水平位置
let playerY; // 宣告角色1在畫布上的垂直位置
let facingDirection = -1; // 設定角色1初始面向左方
let interactionState = "idle"; // 設定角色2初始為站立狀態

const STOP_FRAME_COUNT = 14; // 設定角色1站立精靈圖的影格數
const RUN_FRAME_COUNT = 12; // 設定角色1跑步精靈圖的影格數
const CHARACTER2_STOP_FRAME_COUNT = 2; // 設定角色2站立精靈圖的影格數
const CHARACTER2_ATTACK_FRAME_COUNT = 12; // 設定角色2攻擊精靈圖的影格數
const CHARACTER2_KICK_FRAME_COUNT = 3; // 設定角色2踢擊精靈圖的影格數
const STOP_FRAME_INTERVAL = 100; // 設定角色1站立動畫每格播放的毫秒數
const RUN_FRAME_INTERVAL = 70; // 設定角色1跑步動畫每格播放的毫秒數
const CHARACTER2_STOP_FRAME_INTERVAL = 350; // 設定角色2站立動畫每格播放的毫秒數
const CHARACTER2_ACTION_FRAME_INTERVAL = 90; // 設定角色2動作動畫每格播放的毫秒數
const CHARACTER2_SPRITE_SCALE = 1.7; // 設定角色2精靈圖的顯示縮放比例
const MOVE_SPEED = 4; // 設定角色1每次繪圖時的移動像素數
const INTERACTION_DISTANCE = 145; // 設定角色1靠近角色2時觸發題目的距離
const INTERACTION_RESET_DISTANCE = 190; // 設定角色1離開此距離後重設互動狀態
const QUESTION_OPTIONS = ["10", "12", "13"]; // 設定選擇題顯示的三個答案
const CORRECT_ANSWER_INDEX = 1; // 設定正確答案為第二個選項

function preload() { // 在畫布建立前載入所有角色精靈圖
  stopSprite = loadImage("1/stop/stop.png"); // 載入角色1站立精靈圖
  runSprite = loadImage("1/run/run.png"); // 載入角色1跑步精靈圖
  character2StopSprite = loadImage("2/stop/stop.png"); // 載入角色2站立圖片
  character2AttackSprite = loadImage("2/attack/attack.png"); // 載入角色2攻擊精靈圖
  character2KickSprite = loadImage("2/kick/kick.png"); // 載入角色2踢擊精靈圖
} // 結束精靈圖載入函式

function setup() { // 設定畫布與角色初始狀態
  createCanvas(windowWidth, windowHeight); // 建立符合視窗大小的畫布
  frameRate(60); // 將繪圖更新頻率設定為每秒六十次
  playerX = width * 2 / 3; // 將角色1放在畫布由左起三分之二的位置
  playerY = height / 2; // 將角色1垂直位置設在畫布中央
} // 結束畫布設定函式

function draw() { // 每一個畫面更新時繪製場景與角色
  drawArena(); // 繪製競技場背景
  updateInteraction(); // 檢查角色距離並更新答題互動狀態

  const leftPressed = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  const rightPressed = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const isMoving = interactionState !== "question" && leftPressed !== rightPressed; // 題目顯示時暫停移動並判斷是否正在移動

  if (isMoving && leftPressed) { // 判斷目前是否按住左方向鍵且可以移動
    facingDirection = -1; // 設定角色1面向左方
    playerX -= MOVE_SPEED; // 將角色1往左移動
  } // 結束左方向移動判斷

  if (isMoving && rightPressed) { // 判斷目前是否按住右方向鍵且可以移動
    facingDirection = 1; // 設定角色1面向右方
    playerX += MOVE_SPEED; // 將角色1往右移動
  } // 結束右方向移動判斷

  const activeSprite = isMoving ? runSprite : stopSprite; // 移動時使用角色1跑步圖，否則使用站立圖
  const activeFrameCount = isMoving ? RUN_FRAME_COUNT : STOP_FRAME_COUNT; // 取得角色1目前動畫的影格總數
  const activeFrameWidth = activeSprite.width / activeFrameCount; // 依角色1精靈圖寬度計算單格寬度
  const halfFrameWidth = activeFrameWidth / 2; // 計算角色1目前影格的一半寬度
  const leftLimit = Math.min(halfFrameWidth, width / 2); // 計算角色1可到達的最左側位置
  const rightLimit = Math.max(width - halfFrameWidth, width / 2); // 計算角色1可到達的最右側位置
  playerX = constrain(playerX, leftLimit, rightLimit); // 將角色1限制在畫布水平範圍內
  const character2X = width / 3; // 將角色2固定在畫布由左起三分之一的位置
  const character2Y = height / 2; // 將角色2垂直位置設在畫布中央

  drawCharacter2(character2X, character2Y); // 依互動狀態繪製角色2
  drawCharacter1(activeSprite, activeFrameCount, activeFrameWidth, isMoving); // 繪製角色1目前的動畫影格

  if (interactionState === "question") { // 判斷目前是否正在等待學生回答
    drawQuestionPanel(); // 顯示黃色半透明選擇題方框
  } // 結束題目方框顯示判斷
} // 結束每畫面繪製函式

function drawArena() { // 使用 p5.js 圖形繪製競技場場景
  background(47, 76, 115); // 清除畫布並設定競技場天空底色

  noStroke(); // 關閉圖形外框
  for (let band = 0; band < 12; band += 1) { // 以多層色帶畫出競技場上方的天空光影
    fill(70 + band * 3, 112 + band * 2, 158 + band); // 逐層調整天空色帶顏色
    rect(0, band * height * 0.025, width, height * 0.03); // 繪製一條橫跨畫面的天空色帶
  } // 結束天空色帶繪製迴圈

  fill(31, 42, 64); // 設定競技場屋頂的深色
  quad(0, height * 0.18, width * 0.1, height * 0.08, width * 0.9, height * 0.08, width, height * 0.18); // 畫出上方競技場屋頂
  rect(0, height * 0.16, width, height * 0.035); // 畫出屋頂下方的橫樑

  fill(120, 47, 46); // 設定觀眾席外牆的暗紅色
  quad(0, height * 0.2, width, height * 0.2, width * 0.91, height * 0.57, width * 0.09, height * 0.57); // 畫出梯形觀眾席背景

  fill(164, 67, 55); // 設定觀眾席各層的紅色
  for (let row = 0; row < 7; row += 1) { // 逐層繪製觀眾席座位區
    const rowY = height * (0.23 + row * 0.047); // 計算目前座位層的垂直位置
    const rowInset = width * (0.035 + row * 0.009); // 計算座位層左右縮進的距離
    rect(rowInset, rowY, width - rowInset * 2, height * 0.034); // 畫出目前一層紅色看台
  } // 結束觀眾席座位繪製迴圈

  randomSeed(24); // 固定觀眾點陣的隨機種子，避免每格畫面閃爍
  for (let spectator = 0; spectator < 420; spectator += 1) { // 逐一繪製看台上的觀眾色點
    const spectatorY = random(height * 0.235, height * 0.54); // 隨機選擇觀眾的垂直位置
    const rowProgress = (spectatorY - height * 0.2) / (height * 0.37); // 計算觀眾席由上而下的擴展比例
    const sideInset = width * (0.035 + rowProgress * 0.07); // 計算觀眾席梯形兩側的縮進距離
    const spectatorX = random(sideInset, width - sideInset); // 隨機選擇觀眾的水平位置
    const colorChoice = Math.floor(random(4)); // 隨機選擇觀眾衣服的色彩種類
    if (colorChoice === 0) { // 判斷是否使用金黃色衣服
      fill(255, 202, 92); // 設定觀眾點的金黃色
    } else if (colorChoice === 1) { // 判斷是否使用淺藍色衣服
      fill(100, 203, 224); // 設定觀眾點的淺藍色
    } else if (colorChoice === 2) { // 判斷是否使用米白色衣服
      fill(245, 230, 190); // 設定觀眾點的米白色
    } else { // 使用其他觀眾衣服顏色
      fill(63, 45, 59); // 設定觀眾點的深紫色
    } // 結束觀眾衣服顏色判斷
    circle(spectatorX, spectatorY, random(3, 7)); // 繪製一名簡化造型的觀眾
  } // 結束觀眾點陣繪製迴圈

  fill(37, 43, 58); // 設定競技場圍牆的深灰藍色
  quad(0, height * 0.53, width, height * 0.53, width, height * 0.64, 0, height * 0.64); // 畫出看台前方的競技場圍牆
  fill(238, 186, 84); // 設定圍牆裝飾線的金色
  rect(0, height * 0.535, width, height * 0.012); // 畫出圍牆上方的金色裝飾線
  rect(0, height * 0.625, width, height * 0.009); // 畫出圍牆下方的金色裝飾線

  fill(86, 54, 53); // 設定競技場地面的暖褐色
  quad(0, height * 0.64, width, height * 0.64, width, height, 0, height); // 畫出延伸至畫面底部的競技場地面
  fill(114, 71, 57); // 設定地面上較亮的區域顏色
  quad(0, height * 0.66, width, height * 0.66, width * 0.88, height, width * 0.12, height); // 畫出地面中央的聚光區域

  fill(39, 44, 58, 170); // 設定擂台底座的半透明陰影色
  ellipse(width / 2, height * 0.7, width * 0.72, height * 0.19); // 畫出擂台下方的橢圓陰影
  fill(206, 158, 91); // 設定擂台外緣的沙金色
  ellipse(width / 2, height * 0.675, width * 0.69, height * 0.17); // 畫出橢圓形擂台外緣
  fill(221, 193, 139); // 設定擂台內場的淺沙色
  ellipse(width / 2, height * 0.669, width * 0.61, height * 0.135); // 畫出擂台的橢圓形地板
  noFill(); // 關閉形狀填色以便繪製地板上的線條
  stroke(160, 115, 73); // 設定擂台地板線條的顏色
  strokeWeight(3); // 設定地板線條的粗細
  ellipse(width / 2, height * 0.669, width * 0.34, height * 0.075); // 畫出擂台中央的圓形標記
  line(width * 0.28, height * 0.669, width * 0.72, height * 0.669); // 畫出擂台中央的水平分界線

  noStroke(); // 關閉圖形外框以繪製前景裝飾
  fill(238, 186, 84); // 設定擂台支柱的金色
  for (let pillar = 0; pillar < 6; pillar += 1) { // 逐一繪製競技場周圍的裝飾支柱
    const pillarX = width * (0.08 + pillar * 0.168); // 計算每根支柱的水平位置
    rect(pillarX, height * 0.43, width * 0.012, height * 0.12); // 繪製一根由看台延伸至圍牆的金色支柱
  } // 結束支柱繪製迴圈

  fill(42, 48, 65); // 設定畫面下方前景觀眾席的深色
  for (let seat = 0; seat < 11; seat += 1) { // 逐一繪製畫面底部的前景座椅
    const seatX = width * (seat / 11); // 計算每張座椅的水平位置
    arc(seatX, height * 1.03, width * 0.14, height * 0.13, PI, TWO_PI); // 畫出底部觀眾席座椅的弧形輪廓
  } // 結束前景座椅繪製迴圈
} // 結束競技場背景繪製函式

function updateInteraction() { // 根據角色1與角色2的距離更新互動狀態
  const distance = Math.abs(playerX - width / 3); // 計算兩名角色的水平距離

  if (interactionState !== "idle" && distance > INTERACTION_RESET_DISTANCE) { // 判斷角色1是否已離開互動範圍
    interactionState = "idle"; // 讓角色2恢復站立並重設本次答題狀態
  } // 結束離開互動範圍判斷

  if (interactionState === "idle" && distance <= INTERACTION_DISTANCE) { // 判斷角色1是否首次靠近角色2
    interactionState = "question"; // 開始顯示選擇題並等待作答
  } // 結束靠近角色觸發題目判斷
} // 結束互動狀態更新函式

function drawCharacter1(activeSprite, frameCount, frameWidth, isMoving) { // 繪製角色1目前播放的站立或跑步動畫
  const frameInterval = isMoving ? RUN_FRAME_INTERVAL : STOP_FRAME_INTERVAL; // 依角色1動作選擇動畫速度
  const frameIndex = Math.floor(millis() / frameInterval) % frameCount; // 計算角色1目前循環播放的影格編號
  const sourceX = frameIndex * frameWidth; // 計算角色1影格在精靈圖中的水平起點

  push(); // 儲存目前畫布的座標與變形設定
  translate(playerX, playerY); // 將繪圖原點移至角色1所在位置
  scale(facingDirection, 1); // 依角色1面向決定是否水平翻轉
  imageMode(CENTER); // 設定角色1影格以中心點作為繪圖位置
  image(activeSprite, 0, 0, frameWidth, activeSprite.height, sourceX, 0, frameWidth, activeSprite.height); // 繪製角色1目前動畫影格
  pop(); // 還原畫布原本的座標與變形設定
} // 結束角色1繪製函式

function drawCharacter2(characterX, characterY) { // 繪製角色2目前的站立或答題動作
  let activeSprite = character2StopSprite; // 預設角色2顯示站立圖片
  let frameCount = CHARACTER2_STOP_FRAME_COUNT; // 預設角色2播放站立精靈圖的兩個影格
  let frameInterval = CHARACTER2_STOP_FRAME_INTERVAL; // 設定角色2站立動畫的播放速度

  if (interactionState === "correct") { // 判斷學生答案是否正確
    activeSprite = character2AttackSprite; // 答對時切換至角色2攻擊動畫
    frameCount = CHARACTER2_ATTACK_FRAME_COUNT; // 指定角色2攻擊動畫的影格總數
  } else if (interactionState === "wrong") { // 判斷學生答案是否錯誤
    activeSprite = character2KickSprite; // 答錯時切換至角色2踢擊動畫
    frameCount = CHARACTER2_KICK_FRAME_COUNT; // 指定角色2踢擊動畫的影格總數
  } // 結束角色2答題動作選擇

  push(); // 儲存目前畫布的座標與變形設定
  translate(characterX, characterY); // 將繪圖原點移至角色2所在位置
  scale(playerX >= characterX ? 1 : -1, 1); // 讓角色2面向角色1並在必要時水平翻轉
  imageMode(CENTER); // 設定角色2影格以中心點作為繪圖位置
  const frameWidth = activeSprite.width / frameCount; // 依角色2精靈圖寬度計算單格寬度
  const frameIndex = Math.floor(millis() / frameInterval) % frameCount; // 計算角色2循環播放的影格編號
  const sourceX = frameIndex * frameWidth; // 計算角色2影格在精靈圖中的水平起點
  image(activeSprite, 0, 0, frameWidth * CHARACTER2_SPRITE_SCALE, activeSprite.height * CHARACTER2_SPRITE_SCALE, sourceX, 0, frameWidth, activeSprite.height); // 繪製角色2目前循環播放的影格

  pop(); // 還原畫布原本的座標與變形設定
} // 結束角色2繪製函式

function getAnswerButtonBounds(index) { // 計算指定答案按鈕在畫布上的位置與大小
  const panelWidth = width / 4; // 設定題目方框寬度為畫布的四分之一
  const panelHeight = height / 4; // 設定題目方框高度為畫布的四分之一
  const panelX = (width - panelWidth) / 2; // 計算題目方框置中時的水平位置
  const panelY = height * 0.06; // 設定題目方框位於畫布上方
  const padding = panelWidth * 0.06; // 依題目方框寬度計算內距
  const buttonY = panelY + panelHeight * (0.44 + index * 0.16); // 計算指定答案按鈕的垂直位置
  return { x: panelX + padding, y: buttonY, width: panelWidth - padding * 2, height: panelHeight * 0.13 }; // 傳回答案按鈕的邊界資料
} // 結束答案按鈕位置計算函式

function drawQuestionPanel() { // 繪製黃色半透明選擇題方框與答案按鈕
  const panelWidth = width / 4; // 設定題目方框寬度為畫布的四分之一
  const panelHeight = height / 4; // 設定題目方框高度為畫布的四分之一
  const panelX = (width - panelWidth) / 2; // 計算題目方框置中時的水平位置
  const panelY = height * 0.06; // 設定題目方框位於畫布上方
  const padding = panelWidth * 0.06; // 依題目方框寬度計算文字內距

  noStroke(); // 關閉題目方框與按鈕的外框
  fill(255, 220, 0, 204); // 設定黃色背景並使用百分之八十不透明度
  rect(panelX, panelY, panelWidth, panelHeight, 12); // 繪製四分之一畫布大小的圓角題目方框
  fill(55, 39, 18); // 設定題目文字與按鈕文字的深色
  textAlign(CENTER, CENTER); // 設定方框文字水平置中並垂直置中
  textSize(Math.min(panelWidth * 0.065, 24)); // 依方框寬度設定標題字體大小
  text("挑戰時間！", panelX + panelWidth / 2, panelY + panelHeight * 0.12); // 顯示選擇題標題
  textSize(Math.min(panelWidth * 0.075, 28)); // 設定算術題目文字大小
  text("7 + 5 = ?", panelX + panelWidth / 2, panelY + panelHeight * 0.31); // 顯示本次算術練習題目

  for (let index = 0; index < QUESTION_OPTIONS.length; index += 1) { // 逐一繪製選擇題答案按鈕
    const button = getAnswerButtonBounds(index); // 取得目前答案按鈕的畫布邊界
    fill(255, 248, 210, 230); // 設定答案按鈕的淺黃色底色
    rect(button.x, button.y, button.width, button.height, 6); // 繪製目前的答案按鈕
    fill(55, 39, 18); // 設定答案文字的深色
    textSize(Math.min(button.height * 0.65, 20)); // 依按鈕高度設定答案文字大小
    text((index + 1) + ". " + QUESTION_OPTIONS[index], button.x + button.width / 2, button.y + button.height / 2); // 顯示答案選項與鍵盤快捷鍵
  } // 結束答案按鈕繪製迴圈
} // 結束題目方框繪製函式

function submitAnswer(answerIndex) { // 判斷學生答案並切換角色2動作
  if (interactionState !== "question") { // 確認目前確實有等待作答的題目
    return; // 沒有待回答題目時不處理答案
  } // 結束待回答題目狀態檢查

  interactionState = answerIndex === CORRECT_ANSWER_INDEX ? "correct" : "wrong"; // 依答案正誤切換角色2的攻擊或踢擊狀態
} // 結束答案判斷函式

function mousePressed() { // 處理滑鼠點擊選擇題答案
  if (interactionState !== "question") { // 確認目前題目方框正在顯示
    return; // 題目未顯示時不處理滑鼠點擊
  } // 結束題目顯示狀態檢查

  for (let index = 0; index < QUESTION_OPTIONS.length; index += 1) { // 逐一檢查點擊位置是否落在答案按鈕內
    const button = getAnswerButtonBounds(index); // 取得目前答案按鈕的位置與大小
    const clickedInside = mouseX >= button.x && mouseX <= button.x + button.width && mouseY >= button.y && mouseY <= button.y + button.height; // 判斷滑鼠是否點在答案按鈕範圍內
    if (clickedInside) { // 判斷目前按鈕是否被點選
      submitAnswer(index); // 送出被點選的答案
      return false; // 停止瀏覽器對這次畫布點擊的預設處理
    } // 結束答案按鈕點擊判斷
  } // 結束答案按鈕點擊檢查迴圈
} // 結束滑鼠點擊處理函式

function keyPressed() { // 支援以數字鍵回答並避免方向鍵捲動網頁
  if (interactionState === "question" && key >= "1" && key <= "3") { // 判斷題目顯示時是否按下數字一到三
    submitAnswer(Number(key) - 1); // 將數字鍵轉換為答案選項並送出
    return false; // 停止瀏覽器對數字鍵的預設處理
  } // 結束數字鍵答題判斷

  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 判斷是否按下用來移動角色的方向鍵
    return false; // 停止瀏覽器因方向鍵捲動畫面的預設處理
  } // 結束方向鍵預設行為處理
} // 結束鍵盤按鍵處理函式

function windowResized() { // 視窗尺寸改變時重新調整畫布
  const previousWidth = width; // 記錄調整前的畫布寬度以保留角色相對位置
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿整個視窗
  playerY = height / 2; // 視窗改變後仍將角色垂直置中
  playerX = constrain(playerX / previousWidth * width, 0, width); // 依新畫布寬度調整角色位置並限制在畫布內
} // 結束視窗尺寸調整函式
