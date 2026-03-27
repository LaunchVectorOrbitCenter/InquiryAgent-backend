#*BEFORE CREATING DOCKER IMAGE, execute npm run compile:staging/prod to create a build folder with updated code

FROM fleekbiz.azurecr.io/node:22-slim


WORKDIR /

COPY build/ /
COPY package.json /

RUN npm install --omit=dev

EXPOSE 8007

CMD ["node", "index.js"]
