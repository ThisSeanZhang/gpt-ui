FROM debian:buster-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates
WORKDIR /app
COPY result /app

EXPOSE 65525
CMD ["./backend"]

