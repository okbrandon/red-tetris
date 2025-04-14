class Game {

	constructor(id) {
		this.id = id;
		this.clients = new Set;
	}

	playerJoin(client) {
		if (client.room)
			throw new Error('Client already in a room');

		client.room = this;
		this.clients.add(client);
	}

	playerLeave(client) {
		if (client.room !== this)
			throw new Error('Client not in a room');

		client.room = null;
		this.clients.delete(client);
	}

}

module.exports = Game;
