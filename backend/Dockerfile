# Use an official Node runtime as a parent image
FROM node:latest

# Set the working directory to /app
WORKDIR /

# Copy the current directory contents into the container at /app
COPY . /

# Install net tools to allow local network scen.
RUN apt-get update
RUN apt-get install net-tools

# Install any needed packages specified in package.json
RUN npm i

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV HTTP_PORT 80

# Run app.py when the container launches
CMD ["node", "dist/index.js"]