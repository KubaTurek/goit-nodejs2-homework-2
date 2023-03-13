const fs = require("fs").promises;

const contactsPath = "./db/contacts.json";

function listContacts() {
  fs.readFile(contactsPath).then((jsonData) => {
    console.table(JSON.parse(jsonData));
  });
}

function getContactById(contactId) {
  fs.readFile(contactsPath).then((jsonData) => {
    const data = JSON.parse(jsonData);
    const contact = data.find((contact) => contact.id === `${contactId}`);
    if (!contact) {
      console.log("There is no contact with this ID");
    } else {
      console.table(contact);
    }
  });
}

function addContact(name, email, phone) {
  fs.readFile(contactsPath).then((jsonData) => {
    const contacts = JSON.parse(jsonData);
    const newContactId = contacts.length + 1;
    const newContact = { id: `${newContactId}`, name, email, phone };
    fs.writeFile(contactsPath, JSON.stringify([...contacts, newContact]));
  });
}

function removeContact(contactId) {
  fs.readFile(contactsPath).then((jsonData) => {
    const contacts = JSON.parse(jsonData);
    const filteredContacts = contacts.filter(
      (contact) => contact.id !== contactId
    );
    fs.writeFile(contactsPath, JSON.stringify(filteredContacts));
    console.log("contact has been deleted");
  });
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
};
