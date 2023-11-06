<script setup lang="ts">
import { Message, User } from "~~/types";

const me = ref<User>({
  id: "user",
  avatar: "/avatar.jpg",
  name: "You",
});
const bot = ref<User>({
  id: "assistant",
  avatar: "/bot.jpg",
  name: "Botman",
});

const users = computed(() => [me.value, bot.value]);

const messages = ref<Message[]>([]);

const usersTyping = ref<User[]>([]);

// send messages to Chat API here
// and in the empty function below

const messagesForApi = computed(() =>
  messages.value.map((m) => ({
    role: m.userId,
    content: m.text,
  })).slice(-50) //chatgpt has a token limit(number of words for each request)
);

async function handleNewMessage(message: Message) {
  messages.value.push(message);
  usersTyping.value.push(bot.value);
  const response = await $fetch("/api/ai", {
    method: "POST",
    body: {
      messages: messagesForApi.value,
    },
  });

  // bot answer
  if (!response.choices[0].message?.content) return;
  messages.value.push({
    id: response.id,
    userId: bot.value.id,
    createdAt: new Date(),
    text: response.choices[0].message?.content,
  });

  usersTyping.value = []; //bot stopped typing
}
</script>
<template>
  <ChatBox
    :me="me"
    :users="users"
    :messages="messages"
    @new-message="handleNewMessage"
    :usersTyping="usersTyping"
  />
</template>
