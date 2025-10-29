FROM node:18

WORKDIR /app

COPY package.json yarn.lock ./

# Test npx usage in Dockerfile - should be flagged
# ruleid: npx-usage-shell
RUN npx create-react-app /tmp/test-app

# ruleid: npx-usage-shell
RUN npx --yes @storybook/cli init

# ruleid: npx-usage-shell  
RUN npx prettier@2.8.0 --write .

# Test good alternatives - should not be flagged
# ok: npx-usage-shell
RUN yarn install

# ok: npx-usage-shell
RUN yarn build

# ok: npx-usage-shell
RUN yarn dlx create-react-app /tmp/test-app

COPY . .

# ok: npx-usage-shell
RUN yarn test

EXPOSE 3000

CMD ["yarn", "start"]
