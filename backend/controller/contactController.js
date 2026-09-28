import ContactMessage from "../models/ContactMessage.js";

function normalizeContactPayload(body = {}) {
  return {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    phone: String(body.phone ?? "").trim(),
    branch: String(body.branch ?? "").trim(),
    inquiryType: String(body.inquiryType ?? "").trim(),
    message: String(body.message ?? "").trim(),
  };
}

export async function createContactMessage(req, res) {
  try {
    const payload = normalizeContactPayload(req.body);

    if (!payload.name || !payload.email || !payload.message) {
      return res.status(400).json({
        message: "Name, email, and message are required.",
      });
    }

    const createdMessage = await ContactMessage.create(payload);
    return res.status(201).json(createdMessage);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit contact message.",
      error: error.message,
    });
  }
}

export async function getContactMessages(req, res) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load contact messages.",
      error: error.message,
    });
  }
}

export async function updateContactMessageStatus(req, res) {
  try {
    const status = String(req.body?.status ?? "").trim();
    if (!["new", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    return res.json(updatedMessage);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update contact message.",
      error: error.message,
    });
  }
}

export async function deleteContactMessage(req, res) {
  try {
    const deletedMessage = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete contact message.",
      error: error.message,
    });
  }
}
