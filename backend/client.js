class Client {

	constructor(connection, id, username = null) {
		this.connection = connection;
		this.id = id;
		this.username = username;
		this.room = null;
	}

}

module.exports = Client;
