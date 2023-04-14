const express = require("express");
const router = express.Router();
const { contactValidationSchema } = require("./../../models/contactsModels");

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
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

    if (contactId.length !== 24) {
      return res.status(400).send("Wrong ID provided");
    }
    const contact = await getContactById(contactId);
    res.status(200).json(contact);
  } catch {
    res.status(500).send("Something went wrong");
  }
});

router.post("/", async (req, res, next) => {
  const { error } = contactValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
    return res.json({ message: "Contact wasn't added" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    await removeContact(contactId);
    return res
      .status(200)
      .json({ message: `Contact with id ${contactId} has been deleted` });
  } catch {
    return res.json({ message: "Error occured" });
  }
});

router.put("/:contactId", async (req, res) => {
  const { contactId } = req.params;
  if (!contactId) {
    return res.status(400).send("Id required to change the contact");
  }
  if (contactId.length !== 24) {
    return res.status(400).send("Wrong Id provided");
  }
  const { error } = contactValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const contact = await updateContact(contactId, req.body);
    return res.status(200).send(contact);
  } catch {
    return res.status(500).send("Could not change the contact");
  }
});

router.patch("/:contactId/favorite", async (req, res) => {
  const { contactId } = req.params;
  if (!contactId) {
    return res.status(400).send("Id required to change the contact");
  }
  if (contactId.length !== 24) {
    return res.status(400).send("Wrong Id provided");
  }
  try {
    const contact = await updateStatusContact(contactId, req.body);
    res.status(200).json(contact);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
