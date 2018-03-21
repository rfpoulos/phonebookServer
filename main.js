//Some code for review
var http = require('http');
const fs = require('fs');
const readline = require('readline');
const promisify = require('util').promisify;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

var readlineAsPromise = promisify(fs.readFile);
var writeFileAsPromise = promisify(fs.writeFile);

var saveContacts = function(contacts) {
    writeFileAsPromise('phoneBook.txt', JSON.stringify(contacts));
}

var findContact = function(id, contacts) {
    id = parseInt(id, 10);
    return contacts.find(function(contact) {
        return contact.id === id;
    });
};

var deleteContact = function(contactToDelete, contacts) {
    var newContacts = contacts.filter(function(contact) {
        return contact !== contactToDelete;
    });
    saveContacts(newContacts);
};

var readBody = function(request, callback) {
    var body = '';
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        callback(body);
    });
};

var matches = function(request, method, path) {
    return request.method === method &&
           request.url.startsWith(path);
};

var getSuffix = function(fullUrl, prefix) {
    return fullUrl.slice(prefix.length);
};

var getContacts = function(request, response, contacts) {
    response.end(JSON.stringify(contacts));
};

var postContacts = function(request, response, contacts) {
    readBody(request, function(body) {
        var contact = JSON.parse(body);
        var lastId = contacts[contacts.length - 1]['id'];
        contact.id = ++lastId;
        console.log(contact);
        contacts.push(contact);
        saveContacts(contacts);        
        response.end('Created contact!');
    });
};

var deleteContactfromContacts = function(request, response, contacts) {
    var id = getSuffix(request.url, '/contacts/');
    var contact = findContact(id, contacts);
    deleteContact(contact, contacts);
    console.log(contact);
    response.end('Deleted contact!');
};

var getContact = function(request, response, contacts) {
    var id = getSuffix(request.url, '/contacts/');
    var contact = findContact(id, contacts);
    response.end(JSON.stringify(contact));
};

var putContact = function(request, response, contacts) {
    var id = getSuffix(request.url, '/contacts/');
    var contact = findContact(id, contacts);
    readBody(request, function(body) {
        var newParams = JSON.parse(body);
        Object.assign(contact, newParams);
        saveContacts(contacts);        
        response.end('Updated contact!');
    });
};

var notFound = function(request, response) {
    response.statusCode = 404;
    response.end('404, nothing here!');
};


var routes = [
    { method: 'DELETE', path: '/contacts/', handler: deleteContactfromContacts },
    { method: 'GET', path: '/contacts/', handler: getContact },
    { method: 'PUT', path: '/contacts/', handler: putContact },
    { method: 'GET', path: '/contacts', handler: getContacts },
    { method: 'POST', path: '/contacts', handler: postContacts },
];

var server = http.createServer(function(request, response) {
    readlineAsPromise('phoneBook.txt').then(function(data){
        var contacts = JSON.parse(data);
        var route = routes.find(function(route) {    
            return matches(request, route.method, route.path);
        });
    
        (route ? route.handler : notFound)(request, response, contacts);
    })
});

server.listen(3000);