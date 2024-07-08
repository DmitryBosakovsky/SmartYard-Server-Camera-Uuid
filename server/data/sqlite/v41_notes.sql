CREATE TABLE notes
(
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    create_date INTEGER,
    owner TEXT,
    note_subject TEXT,
    note_body TEXT,
    remind INTEGER DEFAULT 0,
    reminded INTEGER DEFAULT 0,
    color TEXT,
    position_left INTEGER,
    position_top INTEGER,
    position_order INTEGER,
    category TEXT,
    font TEXT
);
CREATE INDEX notes_owner ON notes(owner);
CREATE INDEX notes_remind ON notes(remind);
CREATE INDEX notes_reminded ON notes(reminded);
CREATE INDEX notes_category ON notes(category);