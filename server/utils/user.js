var users = [];

class Users {
  constructor() {
    this.users = [];
  }
  addUser(id, name, room, password) {
    const user = { id, name, room, password };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    const user = this.getUser(id);
    if (user) {
      this.users = this.users.filter(user => user.id !== id);
    }
    return user;
  }
  getUser(id) {
    return this.users.filter(user => user.id === id)[0];
  }

  getUserList(room) {
    var users = this.users.filter(user => user.room === room);
    return users.map(user => user.name);
  }
  getUserOnRoom(room) {
    return this.users.filter(user => user.room === room);
  }
}

module.exports = { Users };
