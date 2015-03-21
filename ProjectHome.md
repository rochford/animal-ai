March 2014 free time project.

http://www.animalguess.com/

I wanted to see if I could create an application that could guess an animal by asking questions. I wanted to learn something about MongoDB, Node.js/Jade, Twitter Bootstrap and Amazon Cloud technologies.

The server works like this:
1) There is a collection of questions.
2) There is a collection of animals. Animals have true/false answers to the above questions.
3) The game started and the server tries to find the best question to ask.
4) based on the answer the next best question is selected until there is a single animal that matches the question/answers.

The trick is to find the best question :) Ideally, half of the animals can be removed based on the answer.
