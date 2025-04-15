class Client {

	constructor(connection, id, username = null) {
		this.connection = connection;
		this.id = id;
		this.username = username;
		this.room = null;
	}

	send(message) {
		console.log('Sending message to client:', message);
		this.connection.send(message);
	}

	emit(event, data) {
		this.connection.emit(event, data);
	}

}

module.exports = Client;
