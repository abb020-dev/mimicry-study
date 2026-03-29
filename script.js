// -------------------------
// script.js
// -------------------------
// Pyodide + Run-button code placed at the TOP (as requested)
// -------------------------

// ---- Pyodide setup ----
let pyodide = null;
let pyodideReady = false;

async function loadPyodideAndPackages() {
  try {
    // Ensure indexURL matches the pyodide script you loaded in index.html
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
    // Optionally load micropip or other packages later:
    // await pyodide.loadPackage(['micropip']);
    pyodideReady = true;
    console.log('Pyodide loaded');
  } catch (e) {
    console.error('Failed to load Pyodide:', e);
  }
}
loadPyodideAndPackages();

// Utility to run Python capturing stdout & exceptions
async function runPythonCaptureOutput(code) {
  if (!pyodideReady) {
    throw new Error("Pyodide not loaded yet");
  }

  // Create a unique name to avoid collisions
  const uid = Date.now().toString();
  const outVar = `_output_${uid}`;

  // Wrap code so we capture stdout manually
  const wrapped =
    `
import sys, io, traceback
${outVar} = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = ${outVar}
try:
` +
    code
      .split("\n")
      .map(line => "    " + line)
      .join("\n") +
    `
except Exception as e:
    sys.stdout = _old_stdout
    raise e
finally:
    sys.stdout = _old_stdout

${outVar}.getvalue()
`;

  try {
    // If Python throws, this will throw a JS error
    const result = await pyodide.runPythonAsync(wrapped);
    return String(result || "");
  } catch (pyError) {
    // Convert Pyodide Python error into a clean JS error
    let message = pyError.message || String(pyError);
    // Optional cleanup: remove Pyodide internal lines
    message = message.replace(/File.*line.*\n?/g, "");
    throw new Error(message.trim());
  }
}

function ensureCodeMirrorFocus(editor) {
  const wrapper = editor.getWrapperElement();

  wrapper.addEventListener("mousedown", () => {
    setTimeout(() => {
      editor.focus();
      editor.refresh();
    }, 0);
  });
}

// -------------------------
// The rest of your original application code
// (keystroke logging, rendering, CodeMirror integration, downloads, translations, etc.)
// Unmodified function names so index.html continues to call setLanguage(...) etc.
// -------------------------

// Define session questions in both English and Korean
// Key: "Added Code:"-commented out code/added my own "Next Steps: Comment explaining something I should do in future"
let session1Questions = {
  en: [
    "Write the Python statement that assigns the value 10 to a variable named radius.",
    'Below is an example showing how to calculate the area of a rectangle using two variables(length and width) and the * operator:\nlength = 10 width = 5\narea = length * width\n print("The area of the rectangle is:", area)\nUsing your understanding of how this code works and how the * operator performs multiplication,write your own line of Python code that calculates the volume of a sphere using one variable named radius set to the value of 2 and the formula: V=4/3πr^3',
    "Use a for loop to print the cubes of the numbers 1–5.",
    "Write two versions of Python code that each calculate the sum of all numbers from 1 to 100: Method 1: Use a for loop to add the numbers from 1 through 100 and print the total. Method 2: Write a single line of code that manually adds each number individually (for example, 1 + 2 + 3 + ... + 100). After writing both, include a comment explaining why the for loop method is easier, shorter, or more efficient than manually adding each number.",
    "The following code is supposed to calculate and print the volume of a sphere, but it contains several errors. Code: radius = input(Enter the radius)volume = 4/3 * 3.14159 * radius ^ 3 print(The volume of the sphere is + volume) Looking at this code, define the errors in a comment and debug the code to fix the problem.",
    "Write a Python program that asks the user to enter:the total cost of several items, and the total number of items purchased. Then calculate and print the average cost per item using the formula: average cost=total cost/number of items. Your program should use variables, arithmetic operators, and print() statements as shown in Chapter 1."
  ],
  ko: [
    "좋아하는 한국 드라마/소설/영화 등의 줄거리를 요약하십시오 (100~120단어 사이)",
    "한국 전통 예절,'정'에 관하여 설명하십시오 (100~120단어 사이)",
    "디지털 학습 도구를 기존의 교육 방법과 어떻게 융합하여 학습 성과를 향상시킬 것인지 설명하십시오 (100~120단어 사이)",
    "한국의 고령화 인구와 경제적 문제의 관계를 논의하십시오 (100~120단어 사이)",
    "한국 교육 시스템의 장단점을 평가하십시오 (100~120단어 사이)",
    "한국의 높은 청년 실업률을 해결하기 위해 필요한 변화를 서술하시오 (100~120단어 사이)"
  ]
};

let session2Questions = {
  en: [
  "Write code that lists 5 variables as strings. Then print out each variable in individual print statements.",

  "Write a short Python script that uses and, or, and not operators inside if statements to check whether a number is within a range (e.g., between 10 and 50).Comment messages showing which conditions are true and false, with comments describing the logic.",

  "Write a Python function count_characters(text) that computes how many vowels and consonants appear in a string.Use variables, a loop, and conditionals.",

  "Write a Python program that takes a list of test scores, removes any values below 50, and calculates the average of the remaining scores.Comment your code to distinguish which part filters data, which part processes data, and which part outputs the result.",

  "Write a Python program that calculates the average of numbers in a list.\n\nIntentionally add one inefficient step (such as repeatedly sorting the list inside a loop).\n\nThen, rewrite it to remove that inefficiency and optimize the code.\n\nUse printed messages to justify which version performs better and why.",

  "Compose a recursive Python function called count_down(n) that prints numbers from n down to 1, then prints \"Blast off!\" at the end.\n\nAfter writing the function:\nAdd code that counts how many times the function calls itself.\n\nPrint that count after the countdown finishes.\n\nUse a global or parameter-based counter to track the total calls."
  ],
  ko: [
    "한국의 세 가지 공휴일의 이름과 각각의 의미를 간략히 설명하십시오 (150~200 단어 사이)",
    "한국 요리가 국제적으로 인기를 끌게 된 이유를 설명하십시오 (150~200 단어 사이)",
    "현재 대학 커리큘럼에 있어 나중에 직업 시장에 더 잘 대비할 수 있도록 개선하기 위해 변경할 요소는 무엇입니까? (150~200 단어 사이)",
    "현대 한국 사회에 있어 유교가 미치는 영향에 대해 설명하십시오 (150~200 단어 사이)",
    "소셜 미디어가 십대들의 정신 건강에 미치는 영향에 대하여 논의하십시오 (150~200 단어 사이)",
    "한국 가정에서 친환경 실천을 촉진하기 위한 방안을 만드십시오 (150~200 단어 사이)"
  ]
};

let session3Questions = {
  en: [
  "Using Python, define a function called greet() that prints a simple message (for example, \"Hello from my function!\").\n\nDefine a second function called farewell() that prints a different message.\n\nCall both functions in the correct way.",

  "Write a Python script that uses the + operator to combine (concatenate) two strings into a full sentence.\n\nChoose your own variable names.\n\nAdd comments explaining what the + operator does when used with strings and how the program works.",

  "Write a Python function multiply_list(nums) that takes a list of numbers and returns the product of all elements.\n\nUse a loop and a running total variable.\n\nAfter defining the function, call it with at least two different lists and print the results.",

  "Write a Python program that reads a list of integers, separates the positive numbers and negative numbers into two new lists, and prints both lists.\n\nUsing comments, divide your code into three sections:\n- data input\n- data processing\n- output",

  "Problem:\nYou are given a list of numbers. Print all numbers that are greater than 50.\n\nVersion A:\nWrite the solution as one block of code using only a loop and an if-statement.\n\nVersion B:\nRewrite the solution using a function named filter_above_50() that takes the list as input and returns a new list containing only the numbers above 50.\n\nThen print the results in a separate output section.\n\nAdd a short explanation via comments judging which structure (single block-Version A vs. function-based design-Version B) is more effective based on criteria such as readability, reuse, and organization.",

  "Create a Python program that simulates a simple class roster manager without using any input() functions.\n\nYour program should:\n- Start with an empty list representing the class roster.\n\n- Use predefined function calls to:\n 1. Add student names to the list.\n2. Remove a student name if it exists in the list.\n3. Display all current student names in alphabetical order.\n\nUse functions to organize your code (e.g., add_student, remove_student, show_roster), and use a loop that runs through a predefined sequence of operations (for example, a list of actions) to simulate a menu system.\n\nEnd Automatically after all predefined operations have been executed (do not use an exit option)"
  ],
  ko: [
    "어린 시절 살았던 지역을 묘사하십시오 (좋아했던 장소나 지역이 그 이후로 어떻게 변했는지 등에 관하여) (200단어 정도로)",
    "한국 문화를 홍보하는 데 있어 한류의 문화적 중요성을 설명하십시오 (200단어 정도로)",
    "한국 사회에서 노인 인구의 디지털 문해력을 높이기 위한 방안을 제시하시오? (200단어 정도로)",
    "다른 국가와 비교했을때 한국의 비교적 낮은 행복지수를 초래한 사회적, 경제적 요인을 분석하고 해결책을 제안하십시오 (200단어 정도로)",
    "한국의 코로나19 팬데믹 대응의 효과를 평가하십시오. 주요 전략은 무엇이며 얼마나 성공적이었습니까? (200단어 정도로)",
    "한국의 소득 불평등을 해결하기 위한 종합적인 정책을 설계하십시오 (200단어 정도로)"
  ]
};

// Session instructions for each session in both English and Korean
//Next Steps: Determine anticipated duration 
let sessionInstructions = {
  session1: {
    en: "Complete each question yourself without using ChatGPT or any other external help.\nAnticipated duration: 30-40 minutes.",
    ko: "각 질문에 대해 ChatGPT나 다른 외부의 도움없이 답변을 직접 작성하십시오.\n각 질문에 100~120 단어 내외로 작성하십시오.\n예상 소요 시간: 30~40분."
  },
  //Added Code: Changed questions to be specific to coding
  session2: {
    en: 'Paste your s1_responses file into ChatGPT along with this prompt: \"For the next 6 coding prompts and follow up explanation questions that I will ask you to answer, respond according to my explanation and coding style shown in the prompts in the file s1_responses that I just uploaded.\" \n \nAfter that, proceed as follows:\n\nCopy the question and directly paste it into ChatGPT.\nCopy the generated response from ChatGPT and paste it into the ChatGPT Version input field.\nIn the Transcribed Version input field, transcribe the generated response by word for word.\nRepeat the above steps for each coding exercise and follow up question in this session.\nAnticipated duration: 30-40 minutes.',
    ko: "요구된 단어수 까지 포함 각 질문을 복사하여 ChatGPT에 입력하십시오.\nChatGPT에서 생성된 응답을 복사하여 해당 질문의 첫 번째 입력 필드에 붙여넣기 하십시오.\n생성된 응답을 한 문장씩 차례로 보며 100~120단어 내외로 패러프레이즈 하십시오.\n패러프레이즈는 텍스트 자체의 의미를 잃지 않으면서 같은 텍스트를 다른 단어로 표현하는 것을 의미합니다.\n위와 같은 절차를 반복해서 각각의 질문에 답변을 하십시오.\n예상 소요 시간: 30~40분."
  },
  session3: {
    en: "Paste your s1_responses file into ChatGPT along with this prompt: \"For the next 6 coding prompts and follow up explanation questions that I will ask you to answer, respond according to my explanation and coding style shown in the prompts in the file s1_responses that I just uploaded.\" \nAfter that, proceed as described in steps 3-7.\nCopy the question and directly paste it into ChatGPT.\nCopy the generated response from ChatGPT and paste it into the ChatGPT Version input field.\nIn the Transcribed Version input field, transcribe the generated response by word for word.\nRepeat steps 3-5 for each coding exercise and follow up question in this session.\nAnticipated duration: 30-40 minutes.",
    ko: "요구된 단어수 까지 포함 각 질문을 복사하여 ChatGPT에 입력하십시오.\nChatGPT에서 생성된 응답을 복사하여 해당 질문의 첫 번째 입력 필드에 붙여넣기 하십시오.\nChatGPT에서 생성된 응답을 보며 해당 질문의 두번째 입력 필드에 그대로 다시 타이핑하십시오.\n위와 같은 절차를 반복해서 각각의 질문에 답변을 하십시오.\n예상 소요 시간: 30~40분."
  }
};

// Global variables to store inputs, keystrokes, and user information
let inputs = [];
let keystrokes = [];
let currentSession = window.FORCED_SESSION || 1;
let userInfo = {};
let totalQuestions = 0; // Track the total number of questions
let language = 'en'; // Default language

// Function to log keystrokes, excluding first input in sessions 2 and 3
// Function to log keystrokes, excluding first input in sessions 2 and 3
function logKeystroke(event) {
  let timestamp = Date.now();
  let key = event.key;

  if (event.key === "Tab") {
    key = "INDENT";
  }
  

  // Try to find the CodeMirror instance's textarea or underlying DOM node
  // event.target will be a DOM node for native events; for CodeMirror keyboard events the 'event' passed by CodeMirror
  // is usually a DOM KeyboardEvent; using event.target should work in most cases.
  let inputIndex = inputs.findIndex(input => input.element === event.target || input.element.getInputElement && input.element.getInputElement && input.element.getInputElement?.() === event.target);

  // If not found using direct target equality, we can attempt a fall-back: match by comparing CodeMirror.display.wrapper.contains(target)
  if (inputIndex === -1) {
    for (let i = 0; i < inputs.length; i++) {
      const el = inputs[i].element;
      if (el && el.getWrapperElement && typeof el.getWrapperElement === 'function') {
        const wrapper = el.getWrapperElement();
        if (wrapper && wrapper.contains && wrapper.contains(event.target)) {
          inputIndex = i;
          break;
        }
      }
    }
  }

  // Identify the current session questions
  let questions;
  if (currentSession === 1) {
    questions = session1Questions[language];
  } else if (currentSession === 2) {
    questions = session2Questions[language];
  } else if (currentSession === 3) {
    questions = session3Questions[language];
  }

  let questionIndex = Math.floor((inputIndex - totalQuestions) / (currentSession === 1 ? 2 : 2));
  let question = questions && questions[questionIndex] ? questions[questionIndex] : null;

  // Skip logging for the first input field in sessions 2 and 3
  if (currentSession !== 1) {
    let isFirstInput = (inputIndex - totalQuestions) % 2 === 0;
    if (isFirstInput) {
      return; // Do not log keystrokes for the first input field
    }
  }

let inputType = inputs[inputIndex]?.type || "unknown";

keystrokes.push({
  s_n: currentSession + 1,
  q: question,
  r_t: inputType, // 🔥 NEW: code vs explanation
  q_n: (questionIndex + 1),
  key: key,
  code: event.code,
  event: event.type,
  timestamp: timestamp,
  repeat: event.repeat
});
}

// Function to start the session after user information is captured
function startSession() {
  hideAlert(); // Hide alert message when starting the session
  let container = document.getElementById('container');
  container.style.display = 'block';
  document.querySelector('.introduction').style.display = 'none';
  
  // Hide user info form
  document.getElementById('user-info-form').style.display = 'none';

  let heading = document.querySelector('h1');
  let subHeading = document.createElement('h2');
  subHeading.className = 'center-text'; // Center the subheading
  if (currentSession === 1) {
    subHeading.textContent = language === 'en' ? 'Bonafide Writing' : '직접 글쓰기';
    renderQuestions(container, session1Questions[language]);
  } else if (currentSession === 2) {
    subHeading.textContent = language === 'en' ? 'Paraphrasing ChatGPT' : 'ChatGPT 패러프레이징';
    renderQuestions(container, session2Questions[language], true); // Pass true to indicate two input fields
  } else if (currentSession === 3) {
    subHeading.textContent = language === 'en' ? 'ChatGPT with Mimicry' : 'ChatGPT 옮겨쓰기';
    renderQuestions(container, session3Questions[language], true); // Pass true to indicate two input fields
  }
  heading.after(subHeading);

  let submitButton = document.createElement('button');
submitButton.className = 'btn center-text';
submitButton.textContent = language === 'en' ? 'Submit' : '제출';
container.appendChild(submitButton);

submitButton.addEventListener('click', () => {
  let questions;

  if (currentSession === 1) {
    questions = session1Questions[language];
  } else if (currentSession === 2) {
    questions = session2Questions[language];
  } else {
    questions = session3Questions[language];
  }

  let twoInputs = currentSession !== 1;

  if (checkAllAnswered(questions, twoInputs)) {
    submitForm();
  } else {
    showAlert(
      language === 'en'
        ? 'Please answer all questions before submitting.'
        : '제출하기 전에 모든 질문에 답하십시오.'
    );
  }
});
}

// Added Code: Fully replaced this function to add the code boxes to replace the text area boxes. Overall this is a function to render questions dynamically
function renderQuestions(container, questions, twoInputs = false) {
  container.innerHTML = "";

  // ===== Instruction Rendering =====
  let instructions = document.createElement('div');
  instructions.className = 'instruction-box';

  let instructionText = '';
  if (currentSession === 1) {
    instructionText = sessionInstructions.session1[language];
  } else if (currentSession === 2) {
    instructionText = sessionInstructions.session2[language];
  } else if (currentSession === 3) {
    instructionText = sessionInstructions.session3[language];
  }

  // Create a paragraph for the instruction heading
  let instructionHeading = document.createElement('p');
  instructionHeading.textContent =
    language === 'en' ? 'Steps to follow:' : '절차에 관한 설명:';
  instructions.appendChild(instructionHeading);

  // Create an ordered list element for the steps
  let instructionList = document.createElement('ol');
  instructionText.split('\n').forEach(line => {
    let listItem = document.createElement('li');
    listItem.textContent = line.trim();
    instructionList.appendChild(listItem);
  });

  instructions.appendChild(instructionList);
  container.appendChild(instructions);
  // ===== End of Instruction Rendering =====


  // ===== Question Rendering =====
  questions.forEach((q, i) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question-block";

    const questionLabel = document.createElement("h3");
    questionLabel.textContent = `${i + 1}. ${q}`;
    questionDiv.appendChild(questionLabel);

    const wordCountDiv = document.createElement("div");
    wordCountDiv.className = "word-count";
    questionDiv.appendChild(wordCountDiv);

    if (twoInputs) {
      // Left input column
      const leftDiv = document.createElement("div");
      leftDiv.className = "input-column left";
      const label1 = document.createElement("label");
      label1.textContent = language === "en" ? "ChatGPT Version" : "버전 1";
      leftDiv.appendChild(label1);

      // ---- Python CodeMirror Editor #1 ----
      let textarea1 = document.createElement("textarea");
      leftDiv.appendChild(textarea1);

      let editor1 = CodeMirror.fromTextArea(textarea1, {
  lineNumbers: true,
  mode: "python",
  theme: "default",
  indentUnit: 4,
  smartIndent: true,
  indentWithTabs: false,
  extraKeys: {
  Tab: function(cm) {
    cm.replaceSelection("    ");
  },
  Backspace: function(cm) {
    let cursor = cm.getCursor();
    let line = cm.getLine(cursor.line);

    if (cursor.ch >= 4 && line.slice(cursor.ch - 4, cursor.ch) === "    ") {
      cm.replaceRange("", {line: cursor.line, ch: cursor.ch - 4}, cursor);
    } else {
      cm.execCommand("delCharBefore");
    }
  }
}
});
      
      ensureCodeMirrorFocus(editor1);
      //Added Code: fully added both editor1on functions
        editor1.on('change', () => {
          updateWordCountEditor(editor1, wordCountDiv);
        });
        editor1.on('keydown', (instance, e) => {
          // e is a DOM event; pass it for keystroke logging
          try { logKeystroke(e); } catch (err) { /* non-fatal */ }
        });
        editor1.on('keyup', (instance, e) => {
          // e is a DOM event; pass it for keystroke logging
          try { logKeystroke(e); } catch (err) { /* non-fatal */ }
        });


      // --------- Run button & output for editor1 ---------
      const runBtn1 = document.createElement('button');
      runBtn1.className = 'runBtn';
      runBtn1.textContent = language === 'en' ? 'Run' : '실행 (버전1)';
      leftDiv.appendChild(runBtn1);

      const output1 = document.createElement('pre');
      output1.className = 'outputBox';
      leftDiv.appendChild(output1);
  runBtn1.addEventListener("click", async () => {
  const code = editor1.getValue().trim();

  if (!pyodideReady) {
    output1.textContent = "Pyodide is still loading...";
    return;
  }

  output1.textContent = "Running...";

  try {
    const out = await runPythonCaptureOutput(code);
    output1.textContent = out || "";
  } catch (err) {
    let cleanMessage = "Your code contains an error.\n\n";
    if (err.message) {
      const lines = err.message.split("\n");
      cleanMessage += lines[lines.length - 1].trim();
    }
    output1.textContent = cleanMessage;
  }
});
      inputs.push({ question: q, element: editor1, type: "code", version: 1 });

      // Right input column
      const rightDiv = document.createElement("div");
      rightDiv.className = "input-column right";
      const label2 = document.createElement("label");
      label2.textContent = language === "en" ? "Transcribed Version" : "버전 2";
      rightDiv.appendChild(label2);

      // ---- Python CodeMirror Editor #2 ----
      let textarea2 = document.createElement("textarea");
      rightDiv.appendChild(textarea2);

      let editor2 = CodeMirror.fromTextArea(textarea2, {
  lineNumbers: true,
  mode: "python",
  theme: "default",
  indentUnit: 4,
  smartIndent: true,
  indentWithTabs: false,
  extraKeys: {
  Tab: function(cm) {
    cm.replaceSelection("    ");
  },
  Backspace: function(cm) {
    let cursor = cm.getCursor();
    let line = cm.getLine(cursor.line);

    if (cursor.ch >= 4 && line.slice(cursor.ch - 4, cursor.ch) === "    ") {
      cm.replaceRange("", {line: cursor.line, ch: cursor.ch - 4}, cursor);
    } else {
      cm.execCommand("delCharBefore");
    }
  }
}
});
      
      ensureCodeMirrorFocus(editor2);
      // 🔒 Disable copy / paste / cut (single editor)
editor2.on("beforeChange", (cm, change) => {
  if (change.origin === "paste") {
    change.cancel();
  }
});

const wrapper = editor2.getWrapperElement();
wrapper.addEventListener("paste", e => e.preventDefault());
wrapper.addEventListener("copy",  e => e.preventDefault());
wrapper.addEventListener("cut",   e => e.preventDefault());
      //Added Code: Fully added editor 2 on
      editor2.on('change', () => {
        updateWordCountEditor(editor2, wordCountDiv);
      });
      editor2.on('keydown', (instance, e) => {
          try { logKeystroke(e); } catch (err) { /* non-fatal */ }
          });
      editor2.on('keyup', (instance, e) => {
          try { logKeystroke(e); } catch (err) { /* non-fatal */ }
          });

      // --------- Run button & output for editor2 ---------
      const runBtn2 = document.createElement('button');
      runBtn2.className = 'runBtn';
      runBtn2.textContent = language === 'en' ? 'Run' : '실행 (버전2)';
      rightDiv.appendChild(runBtn2);

      const output2 = document.createElement('pre');
      output2.className = 'outputBox';
      rightDiv.appendChild(output2);
     runBtn2.addEventListener("click", async () => {
  const code = editor2.getValue().trim();

  if (!pyodideReady) {
    output2.textContent = "Pyodide is still loading...";
    return;
  }

  output2.textContent = "Running...";

  try {
    const out = await runPythonCaptureOutput(code);
    output2.textContent = out || "";
  } catch (err) {
    let cleanMessage = "Your code contains an error.\n\n";
    if (err.message) {
      const lines = err.message.split("\n");
      cleanMessage += lines[lines.length - 1].trim();
    }
    output2.textContent = cleanMessage;
  }
});
     inputs.push({ question: q, element: editor2, type: "code", version: 2 }); 

      const dualDiv = document.createElement("div");
      dualDiv.className = "dual-input";
      dualDiv.appendChild(leftDiv);
      dualDiv.appendChild(rightDiv);
      questionDiv.appendChild(dualDiv);
} else {
  // ---- Single Python Editor ----
  let textarea = document.createElement("textarea");
  questionDiv.appendChild(textarea);

  let editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: "python",
    theme: "default",
    indentUnit: 4,
    smartIndent: true,
  });
ensureCodeMirrorFocus(editor);

  // 🔥 Add live word count
  editor.on("change", () => {
    updateWordCountEditor(editor, wordCountDiv);
  });

  // 🔥 Add keystroke logging for Session 1
  editor.on("keydown", (instance, e) => {
    logKeystroke(e);
  });

  // ---- Run button + output ----
  const runBtn = document.createElement("button");
  runBtn.className = "runBtn";
  runBtn.textContent = language === "en" ? "Run" : "실행";
  questionDiv.appendChild(runBtn);

  const outputSingle = document.createElement("pre");
  outputSingle.className = "outputBox";
  questionDiv.appendChild(outputSingle);
runBtn.addEventListener("click", async () => {
  const code = editor.getValue().trim();

  if (!pyodideReady) {
    outputSingle.textContent = "Pyodide is still loading...";
    return;
  }

  outputSingle.textContent = "Running...";

  try {
    const out = await runPythonCaptureOutput(code);
    outputSingle.textContent = out || "";
  } catch (err) {
    let cleanMessage = "Your code contains an error.\n\n";
    if (err.message) {
      const lines = err.message.split("\n");
      cleanMessage += lines[lines.length - 1].trim();
    }
    outputSingle.textContent = cleanMessage;
  }
});

  inputs.push({ question: q, element: editor, type: "code", version: 1 });
} 
// ===============================
// Explanation section (TEXT INPUT) - NOW TWO VERSIONS
// ===============================
const explanationLabel = document.createElement("div");
explanationLabel.className = "explanation-label";
explanationLabel.textContent =
  `For Prompt ${i + 1}, explain line by line what the code does. ` +
  `Describe the purpose of each significant line or function.`;
questionDiv.appendChild(explanationLabel);

// --- Explanation Version 1 (new, above) ---
const expV1Label = document.createElement("label");
expV1Label.textContent = language === "en" ? "ChatGPT Version" : "버전 1";
questionDiv.appendChild(expV1Label);

const explanationBoxV1 = document.createElement("textarea");
explanationBoxV1.className = "explanation-box";
explanationBoxV1.rows = 6;
questionDiv.appendChild(explanationBoxV1);

explanationBoxV1.addEventListener("keydown", logKeystroke);
explanationBoxV1.addEventListener("keyup", logKeystroke);

inputs.push({
  question: q,
  element: explanationBoxV1,
  type: "explanation",
  version: 1
});

// --- Explanation Version 2 (old one, now labeled) ---
const expV2Label = document.createElement("label");
expV2Label.textContent = language === "en" ? "Transcribed Version" : "버전 2";
questionDiv.appendChild(expV2Label);

const explanationBoxV2 = document.createElement("textarea");
explanationBoxV2.className = "explanation-box";
explanationBoxV2.rows = 6;
questionDiv.appendChild(explanationBoxV2);
explanationBoxV2.addEventListener("paste", (e) => e.preventDefault());
explanationBoxV2.addEventListener("copy",  (e) => e.preventDefault());
explanationBoxV2.addEventListener("cut",   (e) => e.preventDefault());

explanationBoxV2.addEventListener("keydown", logKeystroke);
explanationBoxV2.addEventListener("keyup", logKeystroke);

inputs.push({
  question: q,
  element: explanationBoxV2,
  type: "explanation",
  version: 2
});

// ✅ THIS is what makes the question actually show up:
container.appendChild(questionDiv);

}); // close questions.forEach

return inputs;
} // close renderQuestions


// Function to update word count display
function updateWordCount(input, wordCountDiv) {
  //Added Code: changed value to getValue()
  let wordCount = input.getValue().trim().split(/\s+/).filter(word => word.length > 0).length;
  wordCountDiv.textContent = language === 'en' ? `Word count: ${wordCount}` : `단어 수: ${wordCount}`;
}

//Added Code: Make live word count still update 
function updateWordCountEditor(editor, wordCountDiv) {
  let text = editor.getValue();
  let wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  wordCountDiv.textContent =
    language === 'en'? `Word count: ${wordCount}`
      : `단어 수: ${wordCount}`;
}


// Function to check if all questions are answered
function checkAllAnswered(questions, twoInputs = false) {
  let startIndex = totalQuestions;
  let inputsPerQuestion = twoInputs ? 4 : 2; // code v1 + code v2 + expl v1 + expl v2
  let endIndex = startIndex + questions.length * inputsPerQuestion;

  return inputs
    .slice(startIndex, endIndex)
    .every(input => {
      if (input.type === "explanation") {
        return input.element.value.trim() !== "";
      }
      return input.element.getValue().trim() !== "";
    });
}

// Function to create download link
function createDownloadLink(blob, filename) {
  let url = URL.createObjectURL(blob);
  let link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Function to create a download button
function createDownloadButton(blob, filename, buttonText) {
  let url = URL.createObjectURL(blob);
  let button = document.createElement('button');
  button.className = 'btn center-text';
  button.textContent = buttonText;
  button.addEventListener('click', () => {
    let link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  });
  return button;
}

// Function to submit form data
function submitForm() {
  const session1ResponseStartIndex = 0;
  const session2ResponseStartIndex = session1Questions[language].length;
  const session3ResponseStartIndex = session1Questions[language].length + session2Questions[language].length * 2;
//Added Code: Changed every value to getValue()
  if (checkAllAnswered(session3Questions[language], true)) {
    let responses;

if (currentSession === 1) {
  responses = session1Questions[language].map((q, i) => ({
    session: 1,
    question: q,
    code: inputs[i * 2].element.getValue(),
    explanation: inputs[i * 2 + 1].element.value,
    codeWordCount: getWordCount(inputs[i * 2].element.getValue()),
    explanationWordCount: getWordCount(inputs[i * 2 + 1].element.value)
  }));
}

if (currentSession === 2) {
  responses = session2Questions[language].map((q, i) => ({
  session: 2,
  question: q,
  code_version_1: inputs[i * 4].element.getValue(),
  code_version_2: inputs[i * 4 + 1].element.getValue(),
  explanation_version_1: inputs[i * 4 + 2].element.value,
  explanation_version_2: inputs[i * 4 + 3].element.value
}));
}

if (currentSession === 3) {
  responses = session3Questions[language].map((q, i) => ({
  s: 4,
  q: q,
  q_n: i + 1,
  chatgptAnswer: inputs[i * 4].element.getValue(),
  retype: inputs[i * 4 + 1].element.getValue(),
  explanation_version_1: inputs[i * 4 + 2].element.value,
  explanation_version_2: inputs[i * 4 + 3].element.value
}));
}
    let responseData = {
      responses: responses
    };

    let keystrokeData = {
      keystrokes: keystrokes
    };

    // Capture user information
    let userInfoData = {
      gender: document.querySelector('input[name="gender"]:checked').value,
      age: document.getElementById('age').value,
      handedness: document.querySelector('input[name="handedness"]:checked').value,
      // Added code: commented out korean profieciency koreanProficiency: document.getElementById('korean-proficiency').value,
      // Added code: commented out education level educationLevel: document.getElementById('education-level').value
    };

    // Convert data to JSON format
    let responseJsonData = JSON.stringify(responseData, null, 2);
    let keystrokeJsonData = JSON.stringify(keystrokeData, null, 2);
    let userInfoJsonData = JSON.stringify(userInfoData, null, 2);

    // Create Blobs containing the JSON data
    let responseBlob = new Blob([responseJsonData], { type: 'application/json' });
    let keystrokeBlob = new Blob([keystrokeJsonData], { type: 'application/json' });
    let userInfoBlob = new Blob([userInfoJsonData], { type: 'application/json' });

    // Create URLs to the Blobs
    let responseUrl = URL.createObjectURL(responseBlob);
    let keystrokeUrl = URL.createObjectURL(keystrokeBlob);
    let userInfoUrl = URL.createObjectURL(userInfoBlob);

    // Create link elements to trigger the downloads
    createDownloadLink(responseBlob, 's4_responses.json');
    createDownloadLink(keystrokeBlob, 's3_keystrokes.json');
    createDownloadLink(userInfoBlob, 's4_user_info.json');

    // Show thank you message with buttons to manually download files if needed
    showThankYouMessage(responseBlob, keystrokeBlob, userInfoBlob);

  } else {
    showAlert(language === 'en' ? 'Please complete all questions in the current session.' : '현재 세션의 모든 질문을 완료하십시오.');
  }
}

// Function to calculate the word count
function getWordCount(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Function to show thank you message
function showThankYouMessage(responseBlob, keystrokeBlob, userInfoBlob) {
  let container = document.getElementById('container');
  container.innerHTML = language === 'en' ? '<h2>Thank you for your participation!</h2>' : '<h2>참여해 주셔서 감사합니다!</h2>';
  container.innerHTML += language === 'en' ? '<p>Please email the following JSON files to abb020@bucknell.edu</p>' : '<p>다음 JSON 파일을 abb020@bucknell.edu로 이메일로 보내십시오</p>';

  let list = document.createElement('ul');
  list.innerHTML = `
    <li>s4_responses.json</li>
    <li>s4_keystrokes.json</li>
    <li>s4_user_info.json</li>
  `;
  container.appendChild(list);

  // Add buttons to download the files manually
  let buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';

  buttonContainer.appendChild(createDownloadButton(responseBlob, 's4_responses.json', language === 'en' ? 'Download Responses' : '응답 데이터 다운로드'));
  buttonContainer.appendChild(createDownloadButton(keystrokeBlob, 's4_keystrokes.json', language === 'en' ? 'Download Keystrokes' : '키 데이터 다운로드'));
  buttonContainer.appendChild(createDownloadButton(userInfoBlob, 's4_user_info.json', language === 'en' ? 'Download Demographics' : '사용자 정보 다운로드'));

  container.appendChild(buttonContainer);

  // Add visual feedback
  let visualFeedback = document.createElement('div');
  visualFeedback.className = 'feedback';
  visualFeedback.textContent = language === 'en' ? 'Your responses have been recorded successfully.' : '귀하의 응답이 성공적으로 기록되었습니다.';
  container.appendChild(visualFeedback);
}

// Function to show alert message
function showAlert(message) {
  let alertDiv = document.querySelector('.alert');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    document.querySelector('.container').appendChild(alertDiv); // Append alert to the main container
  }
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';
}

// Function to hide alert message
function hideAlert() {
  let alertDiv = document.querySelector('.alert');
  if (alertDiv) {
    alertDiv.style.display = 'none';
  }
}

// Function to hide the language selection dropdown
function hideLanguageSelection() {
  document.getElementById('language-selection').style.display = 'none';
}

// Event listener for the "Participate" button to include hiding the language selection
// Because script.js loads at the end of body in index.html, the element should exist; still attach safely on DOMContentLoaded
function attachParticipateHandler() {
  const participateBtn = document.getElementById('participateButton');
  if (!participateBtn) return;
  participateBtn.addEventListener('click', function() {
    hideLanguageSelection();
    document.getElementById('introduction').style.display = 'none';
    document.getElementById('user-info-form').style.display = 'block';
  });
}

// Event listener when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  attachParticipateHandler();

  const userInfoForm = document.getElementById('userInfoForm');
  if (userInfoForm) {
    userInfoForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent form submission
      validateUserInfoForm();
    });
  }

  // Initialize input listeners for each input field using event delegation
  initializeEventListeners();
});

// Function to validate user information form
function validateUserInfoForm() {
  let gender = document.querySelector('input[name="gender"]:checked');
  let age = document.getElementById('age').value.trim();
  let handedness = document.querySelector('input[name="handedness"]:checked');
  let errorMessage = '';
  
  if (!gender) {
    errorMessage += language === 'en' ? 'Gender is required. ' : '성별은 필수입니다. ';
  }
  
  if (!age) {
    errorMessage += language === 'en' ? 'Age is required. ' : '나이는 필수입니다. ';
  } else if (!/^\d+$/.test(age) || parseInt(age) < 5 || parseInt(age) > 80) {
    errorMessage += language === 'en' ? 'Please enter a valid age between 5 and 80. ' : '5세에서 80세 사이의 유효한 나이를 입력하십시오. ';
  }
  
  if (!handedness) {
    errorMessage += language === 'en' ? 'Handedness is required. ' : '손잡이는 필수입니다. ';
  }

  if (errorMessage) {
    displayPopupError(errorMessage);
  } else {
    hidePopupError();
    startSession(); // Proceed to the first session of questions
  }
}

// Function to display popup error message
function displayPopupError(message) {
  let errorPopup = document.getElementById('error-popup');
  if (!errorPopup) {
    errorPopup = document.createElement('div');
    errorPopup.id = 'error-popup';
    errorPopup.className = 'error-popup';
    document.body.appendChild(errorPopup);
  }
  errorPopup.textContent = message;
  errorPopup.style.display = 'block';
}

// Function to hide popup error message
function hidePopupError() {
  let errorPopup = document.getElementById('error-popup');
  if (errorPopup) {
    errorPopup.style.display = 'none';
  }
}

// Function to set language and translate content
function setLanguage(lang) {
  language = lang;
  translateContent(lang);
  document.getElementById('language-selection').style.display = 'none'; // Hide language selection after initial choice
}

// Function to translate content based on selected language
function translateContent(lang) {
  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = lang === 'en' ? 'Keystroke Dynamics Research' : '타이핑 패턴 연구';
  
  // Translate introduction paragraphs
  const introText = document.getElementById('introduction-text');
  if (introText) introText.textContent = lang === 'en' ? 
    'Traditional plagiarism detection tools, which primarily rely on direct comparisons between a user’s input and existing sources, often struggle to identify more sophisticated forms of cheating, such as extensive paraphrasing or the use of external assistance, including generative AI or other individuals.' : 
    '기존의 표절 탐지 도구는 주로 사용자의 입력과 기존 출처 간의 직접적인 비교에 의존하기 때문에 광범위한 의역 또는 생성적 AI나 다른 사람의 도움을 포함한 외부 지원과 같은 더 정교한 형태의 부정행위를 식별하는 데 어려움을 겪습니다.';

  const objectiveText = document.getElementById('objective-text');
  if (objectiveText) objectiveText.textContent = lang === 'en' ? 
    'Thus, this study aims to address academic dishonesty in writing by analyzing typing patterns and examining the differences in typing dynamics when individuals write directly compared to when they refer to or copy responses from ChatGPT. These differences are characterized by variations in thinking time, typing speed, and the frequency of editing actions during the writing process.' : 
    '따라서 이 연구는 가상의 시나리오를 통해 타이핑 패턴을 분석하여 글쓰기에서의 부정행위를 식별하는 것을 목표로 합니다. 이 연구는 작성자가 직접 작성할 때와 ChatGPT의 답변을 참고하거나 그대로 옮겨쓸 때의 타이핑 역학이 다르다는 가정에 기반합니다. 이는 생각하는 시간, 타이핑 속도, 그리고 작성 중 수정 행동의 빈도 등이 다르기 때문입니다.';

  // Translate data collection process
  const dataCollProcess = document.getElementById('data-collection-process');
  if (dataCollProcess) dataCollProcess.textContent = lang === 'en' ? 
    'Data Collection Process:' : 
    '데이터 수집 과정:';
  const dataCollDesc = document.getElementById('data-collection-description');
  if (dataCollDesc) dataCollDesc.textContent = lang === 'en' ? 
    'There are three different sessions for collecting data. In each session, participants will respond to six questions using 100-120 words each, which are designed to invoke various cognitive load levels.' : 
    '데이터 수집을 위한 세 가지 다른 세션이 있습니다. 각 세션에는 다양한 인지 부하 수준을 유도하도록 설계된 여섯 가지 질문들이 있고 참가자들은 각 질문에 100-120단어로 답변해야 합니다.';

  const s1desc = document.getElementById('session1-description');
  if (s1desc) s1desc.textContent = lang === 'en' ? 
    'In this session, participants need to generate responses to each question independently, without any external assistance.' : 
    '독립적인 글쓰기 세션: 참가자들은 외부 도움 없이 각 질문에 독립적으로 응답을 생성해야 합니다.';
  const s2desc = document.getElementById('session2-description');
  if (s2desc) s2desc.textContent = lang === 'en' ? 
    'Paraphrasing ChatGPT Session: In this session, participants will feed each question to ChatGPT, then paraphrase the generated response. Paraphrasing is the act of restating a piece of text in your own words while retaining the original meaning.' : 
    'ChatGPT 패러프레이징 세션: 이 세션에서는 참가자들은 각 질문을 ChatGPT에 입력한 후, 생성된 답변을 패러프레이징 해야 합니다. 이때 패러프레이징이란 원래 문장의 의미를 유지하면서도 다른 어휘와 문장 구조를 사용하여 표현하는 것을 의미합니다.';
  const s3desc = document.getElementById('session3-description');
  if (s3desc) s3desc.textContent = lang === 'en' ? 
    'Retyping ChatGPT Session: In this session, participants will feed each prompt to ChatGPT, then retype the generated response, focusing on accurately transcribing the provided answers.' : 
    'ChatGPT 옮겨쓰기 세션: 이 세션에서 참가자들은 각 질문을 ChatGPT에 입력한 후, 생성된 답변을 그대로 재작성할 것입니다.';

  // Translate evaluation criteria
  const evalCrit = document.getElementById('evaluation-criteria');
  if (evalCrit) evalCrit.textContent = lang === 'en' ? 
    'Evaluation Criteria:' : 
    '평가 기준:';
  const evalDesc = document.getElementById('evaluation-description');
  if (evalDesc) evalDesc.textContent = lang === 'en' ? 
    'Upon submission, participant responses will be evaluated based on several criteria:' : 
    '제출 후 참가자 응답은 여러 기준에 따라 평가됩니다:';
  const gram = document.getElementById('grammatical-accuracy');
  if (gram) gram.textContent = lang === 'en' ? 'Grammatical Accuracy' : '문법 정확성';
  const rel = document.getElementById('relevance');
  if (rel) rel.textContent = lang === 'en' ? 'Relevance' : '관련성';
  const len = document.getElementById('length');
  if (len) len.textContent = lang === 'en' ? 'Length' : '길이';

  // Translate violation note
  const violationNote = document.getElementById('violation-note');
  if (violationNote) {
    violationNote.textContent = lang === 'en' ? 
      'Significant violations of the above could result in a reduced amount of payment for participating in this data collection.' : 
      '위의 기준을 심각하게 위반할 경우, 데이터 수집 참여에 대한 보상이 감소될 수 있습니다.';
  }

  const participateBtn = document.getElementById('participateButton');
  if (participateBtn) participateBtn.textContent = lang === 'en' ? 'Proceed to User Information' : '사용자 정보로 진행';
  const userInfoTitle = document.getElementById('user-info-title');
  if (userInfoTitle) userInfoTitle.textContent = lang === 'en' ? 'Please provide your information to proceed:' : '진행하려면 정보를 제공하십시오:';
  const genderLabel = document.getElementById('gender-label');
  if (genderLabel) genderLabel.innerHTML = lang === 'en' ? 'Gender:<span class="required">*</span>' : '성별:<span class="required">*</span>';
  const maleLabel = document.getElementById('male-label');
  if (maleLabel) maleLabel.textContent = lang === 'en' ? 'Male' : '남성';
  const femaleLabel = document.getElementById('female-label');
  if (femaleLabel) femaleLabel.textContent = lang === 'en' ? 'Female' : '여성';
  const otherLabel = document.getElementById('other-label');
  if (otherLabel) otherLabel.textContent = lang === 'en' ? 'Other' : '기타';
  const ageLabel = document.getElementById('age-label');
  if (ageLabel) ageLabel.innerHTML = lang === 'en' ? 'Age:<span class="required">*</span>' : '나이:<span class="required">*</span>';
  const handednessLabel = document.getElementById('handedness-label');
  if (handednessLabel) handednessLabel.innerHTML = lang === 'en' ? 'Handedness:<span class="required">*</span>' : '손잡이:<span class="required">*</span>';
  const rightLabel = document.getElementById('right-handed-label');
  if (rightLabel) rightLabel.textContent = lang === 'en' ? 'Right-handed' : '오른손잡이';
  const leftLabel = document.getElementById('left-handed-label');
  if (leftLabel) leftLabel.textContent = lang === 'en' ? 'Left-handed' : '왼손잡이';
  const proceedBtn = document.getElementById('proceed-button');
  if (proceedBtn) proceedBtn.textContent = lang === 'en' ? 'Proceed to Questions' : '질문으로 진행';
  const errMsg = document.getElementById('error-message');
  if (errMsg) errMsg.textContent = ''; // Clear the error message when changing the language
}


// Function to initialize event listeners for input fields using event delegation
function initializeEventListeners() {
  // Attach event listeners to the document
  document.addEventListener('keydown', handleEvent);
  document.addEventListener('keyup', handleEvent);
  document.addEventListener('input', handleEvent);
}

// Event handler function for delegated events
function handleEvent(event) {
  // Check if the event target is an input field with the class 'input'
  if (event.target.classList && event.target.classList.contains('input')) {
    // Call the appropriate function based on the event type
    if (event.type === 'keydown' || event.type === 'keyup') {
      logKeystroke(event);
    } else if (event.type === 'input') {
      // Update word count if the event is 'input'
      let wordCountDiv = event.target.nextElementSibling;
      if (wordCountDiv && wordCountDiv.classList.contains('word-count')) {
        updateWordCount(event.target, wordCountDiv);
      }
    }
  }
}