FROM node
WORKDIR /opt
COPY package.json yarn.lock ./
RUN yarn
COPY ./ ./
VOLUME /opt/src
VOLUME /opt/build
ENV TARGET=/opt/src
ENTRYPOINT ["yarn", "run"]
CMD ["gulp"]
