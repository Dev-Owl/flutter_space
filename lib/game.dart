import 'dart:ui';

import 'package:flame/game.dart';
import 'package:flame/input.dart';
import 'package:flutter/services.dart';
import 'package:flutter/src/widgets/focus_manager.dart';
import 'package:flutter_space/another_space.dart';
import 'package:flutter_space/space.dart';

class FlutterSpace extends FlameGame with PanDetector, KeyboardEvents {
  final FragmentProgram program;
  final FragmentProgram anotherProgram;
  Vector2 lastTapPoint = Vector2.zero();
  FlutterSpace(
    this.program,
    this.anotherProgram,
  );

  late final SpaceComponent space;
  late final AnotherSpaceComponent anotherSpace;

  @override
  Future<void>? onLoad() async {
    space = SpaceComponent();
    anotherSpace = AnotherSpaceComponent();
    await add(space);
  }

  @override
  KeyEventResult onKeyEvent(
      RawKeyEvent event, Set<LogicalKeyboardKey> keysPressed) {
    if (event is RawKeyDownEvent) {
      if (keysPressed.contains(LogicalKeyboardKey.space)) {
        if (space.isMounted) {
          space.removeFromParent();
          add(anotherSpace);
        } else {
          anotherSpace.removeFromParent();
          add(space);
        }
      }
    }
    return super.onKeyEvent(event, keysPressed);
  }

  @override
  void onPanUpdate(DragUpdateInfo info) {
    lastTapPoint = info.eventPosition.viewport;
  }
}
