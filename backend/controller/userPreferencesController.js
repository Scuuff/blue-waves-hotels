import UserPreference from "../models/UserPreference.js";

function getRequestedUserId(req) {
  const bodyUserId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
  const queryUserId = typeof req.query?.userId === "string" ? req.query.userId.trim() : "";
  return bodyUserId || queryUserId;
}

export async function getUserPreferenceScope(req, res) {
  try {
    const userId = getRequestedUserId(req);
    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const preference = await UserPreference.findOne({
      userId,
      scope: req.params.scope,
    });

    return res.json({
      scope: req.params.scope,
      userId,
      value: {
        value: preference?.value ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load preferences.",
      error: error.message,
    });
  }
}

export async function saveUserPreferenceScope(req, res) {
  try {
    const userId = getRequestedUserId(req);
    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const preference = await UserPreference.findOneAndUpdate(
      {
        userId,
        scope: req.params.scope,
      },
      {
        userId,
        scope: req.params.scope,
        value: req.body?.value ?? {},
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.json({
      scope: preference.scope,
      userId: preference.userId,
      value: {
        value: preference.value,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save preferences.",
      error: error.message,
    });
  }
}

export async function deleteUserPreferenceScope(req, res) {
  try {
    const userId = getRequestedUserId(req);
    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    await UserPreference.findOneAndDelete({
      userId,
      scope: req.params.scope,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete preferences.",
      error: error.message,
    });
  }
}
