# The WebGL Experiments

This is a collection of experiments using the WebGL API. My goal w/ this project was to make a game-like experience
using WebGL that had a nice visual appeal.

In comparison to using a framework like [OpenFramework](https://openframeworks.cc/), this is a more low-level approach
to graphics programming. Unlike OF, you are responsible for manipulating buffers that are held in the GPU memory.
Fortunately, most of this work is done in JS instead of a language like GLSL.

[![Initial Project](https://i.imgur.com/fsDfzNQ.png "Initial Project")](https://i.imgur.com/fsDfzNQ.png "Initial Project")

Once I had an object rendering, I was able to manipulate the shaders to do the equivalent lighting calculations as those
in OF. While they both utilize a variant of GLSL, they did have some minor syntax changes such as the use
of `varying`/`attribute` instead of `in`/`out` and adjustable floating point precision `precision mediump float`.

From there, I added a small game engine to the rendering engine to make a flappy bird clone using the letter F.

[![Flappy Bird](https://s5.gifyu.com/images/SiVSC.gif "Flappy Bird")](https://s5.gifyu.com/images/SiVSC.gif "Flappy Bird")

The adjustable floating-point precision is done w/ a command at the top of the file:

- Low: `precision lowp float` (8-bit)
- Medium: `precision mediump float` (10-bit)
- High: `precision highp float` (16-bit)

From my experiment, they had a minor impact on performance (On my HP Elitebook it was only around 5fps difference) but a
setting too low can cause weird visual artifacts such as seams between different shades of color.

## Sources

- [WebGL Fundamentals](https://webglfundamentals.org/)

## Running

To run this project, you need to have [Yarn](https://yarnpkg.com/) installed.
Then, run the following commands:

```bash
yarn install
yarn start
```

This will start a local server to serve the project.