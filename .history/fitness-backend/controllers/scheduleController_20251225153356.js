import ScheduleEvent from "../models/ScheduleEvent.js";
import Program from "../models/Program.js";
import Challenge from "../models/Challenge.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import { sendNotification } from "../services/notificationService.js"; // ← यही path programController में भी है

// ---------------- UTILS ----------------
const enrichEvents = async (events) => {
  const programIds = [...new Set(events.filter((e) => e.programId).map((e) => e.programId))];
  const challengeIds = [...new Set(events.filter((e) => e.challengeId).map((e) => e.challengeId))];
  const classIds = [...new Set(events.filter((e) => e.classId).map((e) => e.classId))];

  const programs = await Program.find({ id: { $in: programIds } }).select("id title thumbnail").lean();
  const challenges = await Challenge.find({ _id: { $in: challengeIds } }).select("title thumbnail").lean();
  const classes = await Class.find({ _id: { $in: classIds } }).select("title thumbnail").lean();

  return events.map((e) => {
    if (e.programId) {
      const p = programs.find((p) => p.id === e.programId);
      e.sourceName = p?.title || "Program";
      e.sourceThumbnail = p?.thumbnail;
    } else if (e.challengeId) {
      const c = challenges.find((c) => c._id.toString() === e.challengeId.toString());
      e.sourceName = c?.title || "Challenge";
      e.sourceThumbnail = c?.thumbnail;
    } else if (e.classId) {
      const cls = classes.find((c) => c._id.toString() === e.classId.toString());
      e.sourceName = cls?.title || "Class";
      e.sourceThumbnail = cls?.thumbnail;
    } else {
      e.sourceName = "Manual Workout";
    }
    return e;
  });
};

// ---------------- GET MEMBER SCHEDULE ----------------
export const getMemberSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;
    if (!month) return res.status(400).json({ success: false, message: "Month is required" });

    const events = await ScheduleEvent.find({
      userId,
      date: { $regex: `^${month}` },
    })
      .sort({ date: 1, startTime: 1 })
      .lean();

    const enriched = await enrichEvents(events);

    res.json({ success: true, events: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- GET ADMIN SCHEDULE ----------------
export const getAdminSchedule = async (req, res) => {
  try {
    const { month, userId } = req.query;
    if (!month) return res.status(400).json({ success: false, message: "Month is required" });

    const filter = { date: { $regex: `^${month}` } };
    if (userId && userId !== "all") filter.userId = userId;

    const events = await ScheduleEvent.find(filter)
      .populate("userId", "name avatar")
      .sort({ date: 1, startTime: 1 })
      .lean();

    const enriched = await enrichEvents(events);

    res.json({ success: true, events: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- CREATE EVENT ----------------
export const createScheduleEvent = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ success: false, message: "User is required" });
    }

    const event = new ScheduleEvent({
      ...req.body,
      createdBy: req.user._id,
    });

    await event.save();

    const populatedEvent = await ScheduleEvent.findById(event._id)
      .populate("userId", "name avatar")
      .lean();

    // ====== NOTIFICATION ON CREATE ======
    try {
      const userName = populatedEvent.userId?.name || "Member";
      const isAdmin = req.user.role === "admin";
      const workoutTitle = populatedEvent.title || populatedEvent.sourceName || "Workout";

      // User को notification
      await sendNotification(
        populatedEvent.userId._id,
        "user",
        "New Workout Scheduled 🗓️",
        isAdmin
          ? `Your trainer scheduled "${workoutTitle}" for you on ${populatedEvent.date}.`
          : `"${workoutTitle}" has been added to your schedule on ${populatedEvent.date}.`,
        "info",
        "calendar"
      );

      // Admin को confirmation (अगर admin ने बनाया)
      if (isAdmin) {
        await sendNotification(
          req.user._id,
          "admin",
          "Workout Scheduled",
          `You scheduled "${workoutTitle}" for ${userName} on ${populatedEvent.date}.`,
          "success",
          "check-circle"
        );
      }
    } catch (notifyErr) {
      console.error("Notification error on event create:", notifyErr);
    }

    res.status(201).json({ success: true, event: populatedEvent });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- UPDATE EVENT ----------------
export const updateScheduleEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await ScheduleEvent.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const isOwner = event.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    Object.assign(event, req.body);
    await event.save();

    const populatedEvent = await ScheduleEvent.findById(event._id)
      .populate("userId", "name avatar")
      .lean();

    const enriched = await enrichEvents([populatedEvent]);

    // ====== NOTIFICATION ON UPDATE ======
    try {
      const userName = populatedEvent.userId?.name || "Member";
      const workoutTitle = populatedEvent.title || populatedEvent.sourceName || "Workout";

      await sendNotification(
        populatedEvent.userId._id,
        "user",
        "Workout Updated ✏️",
        isAdmin
          ? `Your trainer updated your "${workoutTitle}" on ${populatedEvent.date}.`
          : `Your "${workoutTitle}" on ${populatedEvent.date} has been updated.`,
        "warning",
        "edit"
      );

      if (isAdmin) {
        await sendNotification(
          req.user._id,
          "admin",
          "Workout Updated",
          `You updated ${userName}'s "${workoutTitle}" on ${populatedEvent.date}.`,
          "info",
          "edit"
        );
      }
    } catch (notifyErr) {
      console.error("Notification error on event update:", notifyErr);
    }

    res.json({ success: true, event: enriched[0] });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- DELETE EVENT ----------------
export const deleteScheduleEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await ScheduleEvent.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const isOwner = event.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const eventCopy = { ...event.toObject() };
    const userName = (await User.findById(event.userId).select("name").lean())?.name || "Member";
    const workoutTitle = eventCopy.title || eventCopy.sourceName || "Workout";

    // ====== NOTIFICATION ON DELETE ======
    try {
      await sendNotification(
        event.userId,
        "user",
        "Workout Cancelled ❌",
        isAdmin
          ? `Your trainer cancelled "${workoutTitle}" scheduled on ${eventCopy.date}.`
          : `"${workoutTitle}" on ${eventCopy.date} has been cancelled.`,
        "error",
        "trash"
      );

      if (isAdmin) {
        await sendNotification(
          req.user._id,
          "admin",
          "Workout Cancelled",
          `You cancelled ${userName}'s "${workoutTitle}" on ${eventCopy.date}.`,
          "warning",
          "trash"
        );
      }
    } catch (notifyErr) {
      console.error("Notification error on event delete:", notifyErr);
    }

    await ScheduleEvent.findByIdAndDelete(id);
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- MARK EVENT COMPLETED ----------------
export const markEventCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await ScheduleEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.userId.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    event.completed = true;
    await event.save();

    const populatedEvent = await ScheduleEvent.findById(event._id)
      .populate("userId", "name avatar")
      .lean();

    const workoutTitle = populatedEvent.title || populatedEvent.sourceName || "Workout";
    const userName = populatedEvent.userId?.name || "Member";
    const isAdmin = req.user.role === "admin";

    // ====== NOTIFICATION ON COMPLETED ======
    try {
      if (isAdmin) {
        // Admin marked complete
        await sendNotification(
          populatedEvent.userId._id,
          "user",
          "Workout Marked Complete ✅",
          `Your trainer marked "${workoutTitle}" on ${populatedEvent.date} as completed. Great job!`,
          "success",
          "trophy"
        );

        await sendNotification(
          req.user._id,
          "admin",
          "Marked Complete",
          `You marked ${userName}'s "${workoutTitle}" as completed.`,
          "success",
          "check-circle"
        );
      } else {
        // User completed themselves
        await sendNotification(
          populatedEvent.userId._id,
          "user",
          "Well Done! 🎉",
          `You completed "${workoutTitle}" on ${populatedEvent.date}! Keep pushing! 💪`,
          "success",
          "trophy"
        );
      }
    } catch (notifyErr) {
      console.error("Notification error on complete:", notifyErr);
    }

    res.json({ success: true, event: populatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- DELETE EVENTS BY SOURCE ----------------
export const deleteEventsBySource = async (req, res) => {
  try {
    const { sourceType, sourceId } = req.params;
    if (!["program", "challenge", "class"].includes(sourceType))
      return res.status(400).json({ success: false, message: "Invalid source type" });

    const fieldMap = {
      program: "programId",
      challenge: "challengeId",
      class: "classId",
    };

    // Optional: Notify admins about bulk delete
    try {
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await sendNotification(
          admin._id,
          "admin",
          "Scheduled Events Removed",
          `All scheduled events from ${sourceType} (ID: ${sourceId}) have been deleted.`,
          "warning",
          "trash"
        );
      }
    } catch (notifyErr) {
      console.error("Notification error on bulk delete:", notifyErr);
    }

    await ScheduleEvent.deleteMany({ [fieldMap[sourceType]]: sourceId });

    res.json({ success: true, message: `All ${sourceType} events deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};