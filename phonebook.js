const fs = require('fs');
const readline = require('readline');
const promisfy = require('util').promisify;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

phoneBookArray = [];

var menu = 
    `\n
    Electronic Phone Book\n
    ======================\n
    1. Look up an entry\n
    2. Set an entry\n
    3. Delete an entry\n
    4. List all entries\n
    5. Save entries\n
    6. Restore saved entries\n
    7. Quit\n
    What do you want to do (1-7)?\n`;

var lookUp = function(phoneBookArray, name) {
    phoneBookArray.forEach(function(element){
        if (element.name === name) {
            console.log(element.name + "'s number is " + element.phoneNumber);
        }
    })
    makeMenu();
}

var setEntry = function (phoneBookArray, name, phoneNumber) {
    phoneBookArray.push({'name': name, 'phoneNumber': phoneNumber});
    console.log('Phone Book entry saved.')
    makeMenu();
}

var deleteEntry = function (phoneBookArray, name) {
    for (var i = 0; i < phoneBookArray.length; i++) {
        if (phoneBookArray[i].name === name) {
            phoneBookArray.splice(i, 1);
        }
    }
    makeMenu();
}

var listEntries = function (phoneBookArray) {
    phoneBookArray.sort(function(a, b){
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });
    phoneBookArray.forEach(function(element){
        console.log('Name: ' + element.name + '\    nPhone number: ' + element.phoneNumber);
    })
    makeMenu();
}

var saveEntries = function(phoneBookArray, fileLocation) {
    fs.writeFile('phoneBook.txt', JSON.stringify(phoneBookArray), function(outputErr) {
        if (outputErr) {
          console.log(outputErr.message);
          return;
        }
        console.log(`Wrote to file: ${fileLocation}`);
        makeMenu();
    });
}

var restoreEntries = function(fileLocation) {
    fs.readFile(fileLocation, 'utf8', (err, data) => {
    if (err) {
        phoneBookArray = [];
        return;
    }
    phoneBookArray = JSON.parse(data);
    console.log(phoneBookArray);
    makeMenu();

    });
}

var option = function(choice) {
    if (choice === '1') {
        rl.question('Name: ', function(name){
            lookUp(phoneBookArray, name);
        })
    } else if(choice === '2') {
        rl.question('Name: ', function(name) {
            rl.question('Phone number: ', function(phoneNumber) {
                setEntry(phoneBookArray, name, phoneNumber);
            });
        });
    } else if(choice === '3') {
        rl.question('Name: ', function(name){
            deleteEntry(phoneBookArray, name);
        })
    } else if(choice === '4') {
        listEntries(phoneBookArray);
    } else if(choice === '5') {
        saveEntries(phoneBookArray, 'phoneBook.txt');
    } else if(choice === '6') {
        restoreEntries('phoneBook.txt');
    } else if (choice === '7') {
        rl.close();
    }
}

var makeMenu = function(){
    rl.question(menu, function(choice) {
     option(choice);
    });
};

makeMenu();