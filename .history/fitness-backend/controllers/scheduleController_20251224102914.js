import ScheduleEvent from "../models/ScheduleEvent.js";
import Program from "../models/Program.js";
import Challenge from "../models/Challenge.js";
import Class from "../models/Class.js";
import User from "../models/User.js";

// ---------------- UTILS ----------------
const enrichEvents = async (events) => {
  // Collect all unique ids first
  const programIds = [
    ...new Set(events.filter((e) => e.programId).map((e) => e.programId)),
  ];
  const challengeIds = [
    ...new Set(events.filter((e) => e.challengeId).map((e) => e.challengeId)),
  ];
  const classIds = [
    ...new Set(events.filter((e) => e.classId).map((e) => e.classId)),
  ];

  // FIX 1: Program ke liye _id use karo, id nahi
  const programs = await Program.find({ _id: { $in: programIds } })
    .select("title thumbnail")  // id ki zaroorat nahi
    .lean();

  // Map bana lo fast lookup ke liye
  const programMap = new Map();
  programs.forEach((p) => {
    programMap.set(p._id.toString(), p);
  });

  const challenges = await Challenge.find({ _id: { $in: challengeIds } })
    .select("title thumbnail")
    .lean();

  const challengeMap = new Map();
  challenges.forEach((c) => {
    challengeMap.set(c._id.toString(), c);
  });

  const classes = await Class.find({ _id: { $in: classIds } })
    .select("title thumbnail")
    .lean();

  const classMap = new Map();
  classes.forEach((c) => {
    classMap.set(c._id.toString(), c);
  });

  // Ab events enrich karo
  return events.map((e) => {
    if (e.programId) {
      const p = programMap.get(e.programId);
      e.sourceName = p?.title || "Program";
      e.sourceThumbnail = p?.thumbnail;
    } else if (e.challengeId) {
      const c = challengeMap.get(e.challengeId.toString());
      e.sourceName = c?.title || "Challenge";
      e.sourceThumbnail = c?.thumbnail;
    } else if (e.classId) {
      const cls = classMap.get(e.classId.toString());
      e.sourceName = cls?.title || "Class";
      e.sourceThumbnail = cls?.thumbnail;
    } else {
      e.sourceName = "Manual Workout";
      e.sourceThumbnail = undefined;
    }
    return e;
  });
};

// ---------------- GET MEMBER SCHEDULE ----------------
export const getMemberSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({ success: false, message: "Month is required" });

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
    if (!month)
      return res
        .status(400)
        .json({ success: false, message: "Month is required" });

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
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    const event = new ScheduleEvent({
      ...req.body,
      createdBy: req.user._id, // optional (admin reference)
    });

    await event.save();

    const populatedEvent = await ScheduleEvent.findById(event._id)
      .populate("userId", "name avatar")
      .lean();

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
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const isOwner = event.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    Object.assign(event, req.body);
    await event.save();

    const populatedEvent = await ScheduleEvent.findById(event._id)
      .populate("userId", "name avatar")
      .lean();

    const enriched = await enrichEvents([populatedEvent]);
    res.json({ success: true, event: enriched[0] });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE EVENT
export const deleteScheduleEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await ScheduleEvent.findById(id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const isOwner = event.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
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
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (
      event.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    event.completed = true;
    await event.save();

    res.json({ success: true, event });
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid source type" });

    const fieldMap = {
      program: "programId",
      challenge: "challengeId",
      class: "classId",
    };
    await ScheduleEvent.deleteMany({ [fieldMap[sourceType]]: sourceId });

    res.json({ success: true, message: `All ${sourceType} events deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
