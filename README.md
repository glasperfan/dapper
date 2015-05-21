# Drum Sequencer

_Built by Hugh Zabriskie._

Build basic drum beats in just a few lines of code.


Instructions
------------

add [instrument] [rhythm] --> add `instrument` to the sequence with the specified `rhythm`
remove [instrument] --> remove 'instrument' from the current sequence
build [section] --> beginning building a section called `section`. Until `end section` is called, all created instrument tracks will be added to this sequence.
end [section] --> finish building `section`. All tracks will now be added to the main sequence.
tempo [value] --> set new tempo and reset all tracks. `value` must be between 60 and 240.
play [section (opt)] --> play the specified `section` by beginning the event loop. If `section` is undefined, play the main sequence.
stop --> stop the event loop and reset all sections and the main sequence
pause --> end event loop. restart with `play`

Sequences
---------

There are two classifications of sequences. The main sequence exists as the default destination of tracks.
A user can define new custom sections, however, and then switch between them.

```
> build A
> add .....
> end A
> play A 		// A is now playing
> build B
> add .....
> end B
> play B 		// sequencer will switch to the B section
> play A		// and you can always switch back to A
```