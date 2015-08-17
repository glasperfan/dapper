# Dapper

_Built by Hugh Zabriskie._

Build, play, and record multi-instrumental tracks in just a few lines of code.

Instructions included on the website.

Demo
----

1. Go to http://hughzabriskie.com/login.

Username: guest. 

Password: sequencer. 

Then click on the link.

2. Type or copy/paste the following commands into the command line, one at a time. Press enter after each one. 

All of the commands with "generator" are random music generators based on the parameters inside the parentheses.

add generator(piano,Amaj,4+5,0.5,0.6)
add generator(piano,Amaj,5+6,0.25,1)
add generator(piano,Amaj,2+3,2,0.5)
add dry-kick every 4th sect(a)
add piano(d2,a2) every 8th sect(b) gain(0.8)
add piano(b2,cs3,fs3) every 4th sect(b)
define d
add generator(ride-2,0.5,0.6)

4. Type "play master" and press enter.

5. Try any of the following commands, in any order, at any time.

play master+a
play master+b
play master+a+b+c
play master+a+b+d
play all-b
play

6. Type "pause" and press enter to pause it. You can always play it again (step 5).
