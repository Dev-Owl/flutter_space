import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import 'package:flutter_space/game.dart';

class AnotherSpaceComponent extends PositionComponent
    with HasGameRef<FlutterSpace> {
  double time = 0;

  AnotherSpaceComponent()
      : super(
          position: Vector2.zero(),
        );

  @override
  void update(double dt) {
    time += dt;
    super.update(dt);
  }

  @override
  void render(Canvas canvas) {
    final resolution = Vector2(gameRef.size.x, gameRef.size.y);
    final shader = gameRef.anotherProgram.fragmentShader();
    shader.setFloat(0, resolution.x);
    shader.setFloat(1, resolution.y);
    shader.setFloat(2, time);
    shader.setFloat(3, gameRef.lastTapPoint.x);
    shader.setFloat(4, gameRef.lastTapPoint.y);

    final paint = Paint()..shader = shader;
    canvas.drawRect(
      Rect.fromLTWH(0, 0, gameRef.size.x, gameRef.size.y),
      paint,
    );
  }
}
