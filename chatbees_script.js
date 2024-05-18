(function () {
  const getElementById = (id) => document.getElementById(id);

  const [aid, namespaceName, collectionName] = [
    "chatbeesAccountID",
    "chatbeesNamespaceName",
    "chatbeesCollectionName",
  ]
    .map(getElementById)
    .map((element) => element?.value?.trim());
  if (!aid || !collectionName) {
    window.alert("Please set accountId and collection name.");
    return;
  }
  if (!namespaceName) {
    window.alert("The namespace name should not be empty.");
    return;
  }

  const [
    chatButtonElement,
    chatPopupElement,
    chatAreaElement,
    userMsgElement,
    clearBtnElement,
    closeBtnElement,
    sendMessageBtnElement,
  ] = [
    "chatbeesFloatBtn",
    "chatbeesPopup",
    "chatbeesChatArea",
    "chatbeesUserInput",
    "chatbeesClearBtn",
    "chatbeesCloseBtn",
    "chatbeesSendMessageBtn",
  ].map(getElementById);

  const [emailArea, emailInpub, submitEmailBtn] = [
    "chatbeesEmailInputArea",
    "chatbeesEmailInput",
    "chatbeesSubmitEmailBtn",
  ].map(getElementById);

  let emailAreaDisplay = emailArea.style.display;

  if (!chatPopupElement || !chatAreaElement || !userMsgElement) {
    window.alert(
      "Please put chatbeesPopup, chatbeesChatArea and chatbeesUserInput elements in your HTML.",
    );
    return;
  }

  const localStorageHistoryKey = "chatBeesHistoryMessages";
  let historyMessages;
  const resetMessageHistroy = () => {
    historyMessages = [];
    localStorage.setItem(localStorageHistoryKey, JSON.stringify([]));
  };

  try {
    historyMessages = JSON.parse(localStorage.getItem(localStorageHistoryKey));

    if (!Array.isArray(historyMessages)) {
      resetMessageHistroy();
    }
  } catch {
    resetMessageHistroy();
  }

  const appendUserMessage = (userMsg) => {
    if (!userMsg) {
      return;
    }

    const userMsgDiv = document.createElement("div");
    userMsgDiv.textContent = userMsg;
    userMsgDiv.classList.add("chatbees-message", "chatbees-user");
    chatAreaElement.appendChild(userMsgDiv);

    chatAreaElement.scrollTop = chatAreaElement.scrollHeight;
  };

  const botMessages = {
    greeting: "Hello! How can I assist you?",
    thinking: "Bees are thinking...",
    generateEchoMessage(userMsg) {
      return `Test echo: ${userMsg}`;
    },
    generateErrorMessage({ message }) {
      return `Something went wrong: ${message}`;
    },
  };
  const appendBotMessage = (
    botMsg,
    addReactionButtons = false,
    ...additionalClasses
  ) => {
    const botMsgClasses = ["chatbees-message", "chatbees-bot"];

    const botMsgDiv = document.createElement("div");
    botMsgDiv.classList.add(...botMsgClasses, ...additionalClasses);

    const botMsgPlain = document.createElement("div");
    botMsgPlain.textContent = botMsg.answer;
    botMsgDiv.appendChild(botMsgPlain);
    chatAreaElement.appendChild(botMsgDiv);

    const botMsgSources = document.createElement("div");

    _.uniqBy(
      botMsg.refs?.filter((ref) => ref.doc_name?.match(/https?:\/\//)),
      "doc_name",
    )
      .slice(0, 3)
      .forEach(({ doc_name, sample_text }) => {
        const linkDiv = document.createElement("div");
        linkDiv.classList.add("chatbees-link");
        const link = document.createElement("a");
        link.href = doc_name;
        link.target = "_blank";
        link.innerHTML = `<span title="${sample_text}">${doc_name}</span><img src="images/pop-out-outline.svg" alt="Link" class="chatbees-btn-icon inline">`;
        linkDiv.appendChild(link);
        botMsgSources.appendChild(linkDiv);
      });

    if (botMsg.refs?.length) {
      botMsgDiv.appendChild(document.createElement("br"));
      const sourcesLabel = document.createElement("label");
      sourcesLabel.textContent = "Sources: ";
      sourcesLabel.classList.add("chatbees-section-label");
      botMsgDiv.appendChild(sourcesLabel);
      botMsgDiv.appendChild(botMsgSources);
    }

    if (addReactionButtons) {
      const botReactionButtons = document.createElement("div");
      const reactionButtons = document.createElement("div");
      reactionButtons.classList.add("pt-2");
      const buttonClasses = [
        "inline-flex",
        "items-center",
        "justify-center",
        "bg-white",
        "text-gray-500",
        "shadow",
        "ring-1",
        "ring-inset",
        "ring-gray-300",
        "transition-all",
        "duration-150",
        "rounded-lg",
        "p-2",
        "hover:bg-blue-50",
        "hover:text-blue-700",
        "hover:border-blue-500",
      ];

      const buttonDefinitions = [
        {
          icon: "images/thumbs-up-outline.svg",
          ariaLabel: "Thumbs up",
          action: () => console.log("Thumbs up"),
        },
        {
          icon: "images/thumbs-down-outline.svg",
          ariaLabel: "Thumbs down",
          action: () => console.log("Thumbs down"),
        },
        {
          icon: "images/envelope-outline.svg",
          ariaLabel: "Leave your email",
          action: () => {
            emailAreaDisplay = emailArea.style.display = emailAreaDisplay === "flex" ? "none" : "flex";
            if (emailAreaDisplay === 'flex') {
              emailInpub.focus();
            }
          },
        },
      ];
      buttonDefinitions.forEach(({ icon, ariaLabel, action }) => {
        const button = document.createElement("button");
        button.classList.add(...buttonClasses);
        button.type = "button";
        button.innerHTML = `<img src="${icon}" aria-label="${ariaLabel}" class="chatbees-btn-icon inline">`;
        button.addEventListener("click", action);
        reactionButtons.appendChild(button);
      });
      botReactionButtons.appendChild(reactionButtons);
      botMsgDiv.appendChild(botReactionButtons);
    }

    chatAreaElement.scrollTop = chatAreaElement.scrollHeight;

    return botMsgDiv;
  };

  const restoreHistoryMessagesAndGreet = () => {
    historyMessages.forEach(({ userMsg, botMsg }) => {
      appendUserMessage(userMsg);
      appendBotMessage(botMsg, true);
    });

    appendBotMessage({ answer: botMessages.greeting });
    emailAreaDisplay = emailArea.style.display = "none";
  };

  restoreHistoryMessagesAndGreet();

  const addItemToHistory = (historyItem) => {
    const maxMessages = 10;

    historyMessages.push(historyItem);
    if (historyMessages.length > maxMessages) {
      historyMessages = historyMessages.slice(-maxMessages);
    }

    localStorage.setItem(
      localStorageHistoryKey,
      JSON.stringify(historyMessages),
    );
  };

  const chatbeesSendMessage = () => {
    const userMsg = userMsgElement.value.trim();

    if (!userMsg) {
      return;
    }

    appendUserMessage(userMsg);

    userMsgElement.value = "";
    userMsgElement.focus();

    const thinkMsg = appendBotMessage({ answer: botMessages.thinking });

    if (collectionName === "collectionName") {
      chatAreaElement.removeChild(thinkMsg);

      appendBotMessage({ answer: botMessages.generateEchoMessage(userMsg) });
      return;
    }

    const apiUrl = "https://" + aid + ".us-west-2.aws.chatbees.ai/docs/ask";
    let jsonData = JSON.stringify({
      namespace_name: namespaceName,
      collection_name: collectionName,
      question: userMsg,
    });

    if (historyMessages.length > 0) {
      jsonData = JSON.stringify({
        namespace_name: namespaceName,
        collection_name: collectionName,
        question: userMsg,
        history_messages: historyMessages.reduce(
          (acc, { userMsg, botMsg }) => [...acc, [userMsg, botMsg.answer]],
          [],
        ),
      });
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        // If the collection does not allow public read, please add your api-key here.
        // "api-key": "Replace with your API Key",
        "Content-Type": "application/json",
      },
      body: jsonData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(
          `status: ${response.status}, error: ${response.statusText}`,
        );
      })
      .then((botMsg) => {
        chatAreaElement.removeChild(thinkMsg);
        appendBotMessage(botMsg, true);

        addItemToHistory({ userMsg, botMsg });
      })
      .catch((error) => {
        console.error("Error:", error);
        chatAreaElement.removeChild(thinkMsg);

        appendBotMessage(
          { answer: botMessages.generateErrorMessage(error) },
          false,
          "chatbees-error",
        );
      });
  };

  chatButtonElement?.addEventListener("click", () => {
    chatPopupElement.style.display = "flex";

    userMsgElement.focus();
  });

  clearBtnElement?.addEventListener("click", () => {
    chatAreaElement.innerHTML = "";
    userMsgElement.value = "";
    userMsgElement.focus();

    resetMessageHistroy();
    restoreHistoryMessagesAndGreet();
  });

  closeBtnElement?.addEventListener("click", () => {
    chatPopupElement.style.display = "none";
  });

  sendMessageBtnElement?.addEventListener("click", () => {
    chatbeesSendMessage();
  });

  userMsgElement.addEventListener("keyup", (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      chatbeesSendMessage();
    }
  });
})();
