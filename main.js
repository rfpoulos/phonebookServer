//Some code for review
const http = require('http');
const fs = require('fs');
const readline = require('readline');
const promisify = require('util').promisify;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const readlineAsPromise = promisify(fs.readFile);
const writeFileAsPromise = promisify(fs.writeFile);

let saveContacts = function(contacts) {
    writeFileAsPromise('phoneBook.txt', JSON.stringify(contacts));
}

let findContact = function(id, contacts) {
    id = parseInt(id, 10);
    return contacts.find(function(contact) {
        return contact.id === id;
    });
};

let deleteContact = function(contactToDelete, contacts) {
    let newContacts = contacts.filter(function(contact) {
        return contact !== contactToDelete;
    });
    saveContacts(newContacts);
};

let readBody = function(request, callback) {
    let body = '';
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        callback(body);
    });
};

let matches = function(request, method, path) {
    return request.method === method &&
           request.url.startsWith(path);
};

let getSuffix = (fullUrl, prefix) => fullUrl.slice(prefix.length);

let getContacts = function(request, response, contacts) {
    response.end(JSON.stringify(contacts));
};

let postContacts = function(request, response, contacts) {
    readBody(request, function(body) {
        let contact = JSON.parse(body);
        let lastId = contacts[contacts.length - 1]['id'];
        contact.id = ++lastId;
        console.log(contact);
        contacts.push(contact);
        saveContacts(contacts);        
        response.end('Created contact!');
    });
};

let deleteContactfromContacts = function(request, response, contacts) {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id, contacts);
    deleteContact(contact, contacts);
    console.log(contact);
    response.end('Deleted contact!');
};

let getContact = function(request, response, contacts) {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id, contacts);
    response.end(JSON.stringify(contact));
};

let putContact = function(request, response, contacts) {
    let id = getSuffix(request.url, '/contacts/');
    let contact = findContact(id, contacts);
    readBody(request, function(body) {
        let newParams = JSON.parse(body);
        Object.assign(contact, newParams);
        saveContacts(contacts);        
        response.end('Updated contact!');
    });
};

let notFound = function(request, response) {
    response.statusCode = 404;
    response.end('404, nothing here!');
};


let routes = [
    { method: 'DELETE', path: '/contacts/', handler: deleteContactfromContacts },
    { method: 'GET', path: '/contacts/', handler: getContact },
    { method: 'PUT', path: '/contacts/', handler: putContact },
    { method: 'GET', path: '/contacts', handler: getContacts },
    { method: 'POST', path: '/contacts', handler: postContacts },
];

let server = http.createServer(function(request, response) {
    readlineAsPromise('phoneBook.txt').then(function(data){
        let contacts = JSON.parse(data);
        let route = routes.find(route => matches(request, route.method, route.path));
    
        (route ? route.handler : notFound)(request, response, contacts);
    })
});

server.listen(3000);