import 'dart:ui';

import 'package:flame/game.dart';
import 'package:flame/input.dart';
import 'package:flutter_space/space.dart';

class FlutterSpace extends FlameGame with PanDetector {
  final FragmentProgram program;
  Vector2 lastTapPoint = Vector2.zero();
  FlutterSpace(this.program);

  @override
  Future<void>? onLoad() async {
    await add(
      SpaceComponent(),
    );
  }

  @override
  void onPanUpdate(DragUpdateInfo info) {
    lastTapPoint = info.eventPosition.viewport;
  }
}
