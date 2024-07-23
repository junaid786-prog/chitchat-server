const { Note, validateNote } = require("../models/note.model");
const { CatchAsync } = require("../utils/CatchAsync");

const NoteController = {
    create: CatchAsync(async (req, res) => {
        const { error, value: data } = validateNote(req.body);
        if (error) {
            throw new ValidationError(error.details[0].message);
        }
        const { customer, content } = data;

        const newNote = new Note({
            customer,
            content,
        });

        await newNote.save();

        res.status(201).json({
            status: "success",
            data: { note: newNote },
        });
    }),

    find: CatchAsync(async (req, res) => {
        const notes = await Note.find();

        res.status(200).json({
            status: "success",
            data: { notes },
        });
    }),

    findOne: CatchAsync(async (req, res) => {
        const { id } = req.params;

        const note = await Note.findById(id);
        if (!note) {
            throw new NotFoundError("Note not found");
        }

        res.status(200).json({
            status: "success",
            data: { note },
        });
    }),
};

module.exports = NoteController;