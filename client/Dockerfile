# Use the official Node.js image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY .env .env
COPY . .

# Copy the .env file from the example if no .env file exists
#RUN mv .env.example .env 2>/dev/null

ENV NEXT_PUBLIC_SERVER_HOST=aye-aye.robbiebyrd.com
ENV NEXT_PUBLIC_SERVER_PORT=443
ENV NEXT_PUBLIC_SERVER_PROTOCOL=https
ENV NEXT_PUBLIC_WS_SERVER_HOST=aye-aye.robbiebyrd.com
ENV NEXT_PUBLIC_WS_SERVER_PORT=443
ENV NEXT_PUBLIC_WS_SERVER_PROTOCOL=wss

# Build the Next.js app
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
