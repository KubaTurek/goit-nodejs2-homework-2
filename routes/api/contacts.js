const express = require("express");
const router = express.Router();
const { contactSchema } = require("./../../models/contactsModels");

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("./../../models/contactsModels");


router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
    return res.status(500).send("Something went wrong");
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    res.status(200).json(contact);
  } catch {
    res.status(500).send("Something went wrong");
  }
});

router.post("/", async (req, res, next) => {
  console.log("test");

  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
    res.json({ message: "Contact wasn't added" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    await removeContact(contactId);
    res
      .status(200)
      .json({ message: `Contact with id ${contactId} has been deleted` });
  } catch {
    res.json({ message: "Error occured" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const { contactId } = req.params;
    const contact = await updateContact(contactId, req.body);
    res.status(200).json(contact);
  } catch {
    res.json({ message: "Could not change the contact" });
  }
});

module.exports = router;
