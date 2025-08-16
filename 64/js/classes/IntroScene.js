class IntroScene {
  constructor(target, onQuit) {
    let overlay = document.getElementById('joystick-overlay');
    this.onQuit = () => {
      if (overlay) overlay.style['pointerEvents'] = 'auto'; // restore the joystick overlay's clickability
      onQuit();
    };
    if (overlay) overlay.style['pointerEvents'] = 'none'; // allow clicks past the joystick overlay

    // Example usage
    const canvas = document.createElement('canvas');

    const ftlCanvasArr = sliceCanvas(ftlImg, 64, 64);
    let solarFlareCanvasArr = sliceCanvas(solarFlareImg, 64, 64);
    const outOfControlCanvasArr = sliceCanvas(outOfControlImg, 64, 64);
    const aimForPlanetCanvasArr = sliceCanvas(aimForPlanetImg, 64, 64);
    const aimForPlanetPauseCanvasArr = sliceCanvas(aimForPlanetPauseImg, 64, 64);
    const flyToPlanetCanvasArr = sliceCanvas(flyToPlanetImg, 64, 64);
    let splashDownCanvasArr = sliceCanvas(splashDownImg, 64, 64);
    const driftCanvasArr = sliceCanvas(driftImg, 64, 64);
    const bsLayCanvasArr = sliceCanvas(bsLayImg, 64, 64);
    const bsShineCanvasArr = sliceCanvas(bsShineImg, 64, 64);
    const bsLaySunCanvasArr = sliceCanvas(bsLaySunImg, 64, 64);
    const bsWakeCanvasArr = sliceCanvas(bsWakeImg, 64, 64);
    const bsSitCanvasArr = sliceCanvas(bsSitImg, 64, 64);
    const bsGetUpCanvasArr = sliceCanvas(bsGetUpImg, 64, 64);
    const bsStandCanvasArr = sliceCanvas(bsStandImg, 64, 64);
    const childEncounterCanvasArr = sliceCanvas(childEncounterImg, 64, 64);

    solarFlareCanvasArr = solarFlareCanvasArr.slice(0, -1);
    splashDownCanvasArr = splashDownCanvasArr.slice(0, -2);

    // console.log("splashDownCanvasArr.length:", splashDownCanvasArr.length);

    // // build frames
    const frames = [];

    const INTRO_TEXT = `Next Star: H374b`;

    frames.push({ canvas: ftlCanvasArr[0], duration: 150, text: INTRO_TEXT, sfx: 'ftl' });
    frames.push({ canvas: ftlCanvasArr[1], duration: 150, text: INTRO_TEXT });
    frames.push({ canvas: ftlCanvasArr[2], duration: 150, text: INTRO_TEXT, sfx: 'btn_c' });
    frames.push({ canvas: ftlCanvasArr[3], duration: 150, text: INTRO_TEXT, sfx: 'btn_e' });
    frames.push({ canvas: ftlCanvasArr[4], duration: 150, text: INTRO_TEXT });
    frames.push({ canvas: ftlCanvasArr[5], duration: 150, text: INTRO_TEXT, sfx: 'btn_e' });
    frames.push({ canvas: ftlCanvasArr[6], duration: 150, text: INTRO_TEXT });
    frames.push({ canvas: ftlCanvasArr[7], duration: 150, text: INTRO_TEXT, sfx: 'btn_g' });


    frames.push(
      ...solarFlareCanvasArr.map((n,i) => {
        return { canvas: n, duration: 250, sfx: i===2 ? 'solar_flare' : undefined };
      })
    );
    frames.push(
      ...outOfControlCanvasArr.map((n,i) => {
        return {
          canvas: n,
          duration: 250,
          text: 'Tap to stabilize!',
          sfx: i === 0 ? 'out_of_control' : undefined,
        };
      })
    );
    frames.push({ canvas: aimForPlanetCanvasArr[0], duration: 150, sfx: 'ftl' });
    frames.push({ canvas: aimForPlanetCanvasArr[0], duration: 150, text: 'Systems critical!' });
    frames.push(
      ...aimForPlanetCanvasArr.map((n,i) => {
        return {
          canvas: n,
          duration: 250
        };
      })
    );
    frames.push({ canvas: aimForPlanetPauseCanvasArr[0], duration: 150, text: 'Attempt to land!', sfx: 'ftl' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[1], duration: 150, text: 'Attempt to land!' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[2], duration: 150, text: 'Attempt to land!', sfx: 'btn_c' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[3], duration: 150, text: 'Attempt to land!', sfx: 'btn_fs' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[4], duration: 150, text: 'Attempt to land!' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[5], duration: 150, text: 'Attempt to land!', sfx: 'btn_fs' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[6], duration: 150, text: 'Attempt to land!' });
    frames.push({ canvas: aimForPlanetPauseCanvasArr[7], duration: 150, text: 'Attempt to land!', sfx: 'btn_cs' });
    
    frames.push(
      ...flyToPlanetCanvasArr.map((n,i) => {
        return {
          canvas: n,
          duration: 250,
          sfx: i === 0 ? 'fly_to_planet' : undefined,
        };
      })
    );
    // frames.push({ canvas: flyToPlanetCanvasArr[flyToPlanetCanvasArr.length - 1], duration: 500, text: 'Crash imminent!', sfx: 'alarm_cs' });
    frames.push({ canvas: flyToPlanetCanvasArr[flyToPlanetCanvasArr.length - 1], duration: 500, text: 'Crash imminent!', sfx: 'alarm_c' });
    frames.push({ canvas: flyToPlanetCanvasArr[flyToPlanetCanvasArr.length - 1], duration: 500, text: 'Crash imminent!', sfx: 'alarm_fs' });
    
    frames.push(
      ...splashDownCanvasArr.map((n,i) => {
        let sfx = undefined;
        if(i === 0) {
          sfx = 'fly_down';
        } else if (i === 7) {
          sfx = 'splash_down';
        }
        return {
          canvas: n,
          duration: 250,
          sfx
        };
      })
    );

    frames.push(
      ...driftCanvasArr.map((n,i) => {
        return {
          canvas: n,
          duration: 350,
          sfx: (i % 4) === 0 ? 'heartbeat' : undefined
        };
      })
    );

    frames.push({canvas: bsLayCanvasArr[0], duration: 350, text: "...", sfx: 'beach_wave'});
    frames.push({canvas: bsLayCanvasArr[1], duration: 350, text: "..."});
    frames.push({canvas: bsLayCanvasArr[2], duration: 350, text: "..."});
    frames.push({canvas: bsLayCanvasArr[3], duration: 350, text: "..."});
    frames.push({canvas: bsLayCanvasArr[4], duration: 350, text: "..."});
    frames.push({canvas: bsLayCanvasArr[5], duration: 350, text: "..."});
    frames.push(
      ...bsLayCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350};
      })
    );
    frames.push(
      ...bsShineCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350};
      })
    );
    frames.push(
      ...bsLaySunCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350, text: "Charging..."};
      })
    );
    frames.push(
      ...bsWakeCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350};
      })
    );
    frames.push(
      ...bsSitCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350, text: "Calibrating..."};
      })
    );
    frames.push(
      ...bsGetUpCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350};
      })
    );
    frames.push({canvas: bsStandCanvasArr[0], duration: 350, text: "Scanning...", sfx: 'scanning'});
    frames.push({canvas: bsStandCanvasArr[1], duration: 350, text: "Scanning..."});
    frames.push({canvas: bsStandCanvasArr[2], duration: 350, text: "Scanning..."});
    frames.push({canvas: bsStandCanvasArr[3], duration: 350, text: "Scanning..."});
    frames.push({canvas: bsStandCanvasArr[4], duration: 350, text: "Scanning..."});
    frames.push({canvas: bsStandCanvasArr[5], duration: 350, text: "Scanning..."});
    frames.push(
      ...childEncounterCanvasArr.map((n,i) => {
        return {canvas: n,duration: 350, text: "Fauna detected."};
      })
    );

    this.cfp = new CanvasFramePlayer(target, frames, 12);
    this.cfp.play();
  }

  update(time, keyboard) {
    this.cfp.update(time * 1000);
  }
}
