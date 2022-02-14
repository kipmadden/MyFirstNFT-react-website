import * as Animatable from "react-native-animatable";
import React from "react";

export default function SimpleAnimatable() {
  return (
    <Animatable.View>
      <Animatable.Text
        animation="flash"
        iterationCount={"infinite"}
        direction="normal"
      >
        Minting..
      </Animatable.Text>
    </Animatable.View>
  );
}