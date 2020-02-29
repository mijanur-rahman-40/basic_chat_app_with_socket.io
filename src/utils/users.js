const users = [];

const addUser = ({ id, username, room }) => {

    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // store User
    const user = { id, username, room };
    users.push(user);

    return { user };
}

// delete the specific user
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        // delete user
        return users.splice(index, 1)[0];
    }
}

// get the specific user
const getUser = (id) => {
    return users.find((user) => user.id === id);
}

// here keep all of the users where the users room equals the room we looking for
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};