import 'dart:typed_data';

import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import 'package:flutter_space/game.dart';

class SpaceComponent extends PositionComponent with HasGameRef<FlutterSpace> {
  double time = 0;

  SpaceComponent()
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
    var uniformFloats = <double>[];
    uniformFloats.add(resolution.x);
    uniformFloats.add(resolution.y);
    uniformFloats.add(time);
    uniformFloats.add(gameRef.lastTapPoint.x);
    uniformFloats.add(gameRef.lastTapPoint.y);
    final shader = gameRef.program.shader(
      floatUniforms: Float32List.fromList(uniformFloats),
    );
    final paint = Paint()..shader = shader;
    canvas.drawRect(
      Rect.fromLTWH(
        0,
        0,
        gameRef.size.x,
        gameRef.size.y,
      ),
      paint,
    );
  }
}
