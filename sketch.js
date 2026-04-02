/**
 * Robot face — same geometry as the original Processing sketch.
 * p5.js for browser / GitHub Pages.
 */

function setup() {
  const c = createCanvas(400, 570);
  c.parent("canvas-wrap");
  noLoop();
}

function draw() {
  background(0, 102, 102);

  stroke(255);
  strokeWeight(5);
  noFill();

  arc(200, 224, 200, 200, PI, TWO_PI);
  line(100, 224, 105, 345);
  line(300, 224, 295, 345);
  arc(200, 340, 190, 190, 0, PI);

  line(200, 125, 200, 200);
  line(200, 400, 200, 435);

  arc(200, 212, 20, 20, PI, TWO_PI);
  line(210, 212, 210, 340);
  line(190, 212, 190, 340);
  arc(200, 340, 20, 20, 0, PI);

  ellipse(180, 345, 20, 20);
  ellipse(220, 345, 20, 20);
  line(170, 345, 105, 345);
  line(230, 345, 295, 345);

  ellipse(250, 225, 34, 48);
  bezier(150, 201, 155, 156, 117, 164, 110, 180);
  bezier(250, 201, 245, 156, 283, 164, 290, 180);
  curve(200, 180, 250, 249, 210, 286, 150, 201);
  curve(200, 180, 150, 249, 190, 286, 250, 201);

  arc(174, 201, 48, 48, HALF_PI, PI);
  arc(126, 201, 48, 48, 0, HALF_PI);
  arc(174, 249, 48, 48, PI, PI + HALF_PI);
  arc(126, 249, 48, 48, PI + HALF_PI, TWO_PI);

  curve(250, 249, 250, 380, 150, 380, 150, 249);
  curve(250, 340, 250, 380, 150, 380, 150, 340);
  bezier(150, 380, 185, 370, 190, 365, 200, 378);
  bezier(250, 380, 215, 370, 210, 365, 200, 378);
}
