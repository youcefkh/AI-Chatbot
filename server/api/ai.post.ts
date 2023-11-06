import { OpenAIApi, Configuration } from "openai";
import {customerSupportAgent} from '~~/agents';
import * as agents from '~~/agents';

export default defineEventHandler(async (event) => {
  const { OPENAI_API_KEY } = useRuntimeConfig();
  const body = await readBody(event);
  const agent = body.agent || "customerSupportAgent"

  if(!Object.keys(agents).includes(agent)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid agent",
    });
  }

  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    messages: body.messages || [],
    model: "gpt-3.5-turbo",
    temperature: body.temperature || 1,
    //@ts-expect-error checking above if the agent exists
    ...agents[agent](body),
  });
  
  return completion.data;
});
