const { TaskTimer } = require('tasktimer');
const superagent = require('superagent');
const sensor = require("node-dht-sensor");
const config = require('config');

const timer = new TaskTimer(config.get('Client.timer'));

timer.on('tick', () => reportData());
timer.start();

function reportData() {
    console.log(`Tick count: ${timer.tickCount}`)

    sensor.read(22, config.get('Client.dht22pin'), function(err, temperature, humidity) {
        if (!err) {
            console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);

            submitAPIData('temperature', temperature);
            submitAPIData('humidity', humidity);
        }
        else {
            console.log(err);
        }
      });
}

function submitAPIData(sensor, value) {
    superagent.get(config.get('Client.endpoint'))
        .query({ 
            room: config.get('Client.room'), 
            sensor: sensor, 
            value: value 
        })
        .end((err, res) => {
            if (err) { return console.log(err); }
                console.log(res.body.url);
                console.log(res.body.explanation);
        });
}