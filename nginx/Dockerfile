FROM nginx:latest

COPY ./nginx.conf /etc/nginx/nginx.conf

# Append "daemon off;" to the beginning of the configuration
# in order to avoid an exit of the container
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

VOLUME /usr/local/etc/nginx/psw /etc/nginx/psw
VOLUME /usr/local/etc/nginx/ssl /etc/nginx/ssl

# Define default command
CMD service nginx start