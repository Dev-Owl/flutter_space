import 'package:flame/flame.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'dart:ui' as ui;

import 'package:flutter/services.dart';
import 'package:flutter_space/game.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final program = await ui.FragmentProgram.compile(
    spirv: (await rootBundle.load('assets/shaders/space.frag.spv')).buffer,
    debugPrint: true,
  );
  await Flame.device.fullScreen();
  final game = FlutterSpace(program);
  runApp(MaterialApp(
    home: GameWidget(
      game: game,
      loadingBuilder: (context) => const Material(
        child: Center(
          child: CircularProgressIndicator(),
        ),
      ),
      //Work in progress error handling
      errorBuilder: (context, ex) {
        //Print the error in th dev console
        debugPrint(ex.toString());
        return const Material(
          child: Center(
            child: Text('Sorry, something went wrong. Reload me'),
          ),
        );
      },
    ),
  ));
}
