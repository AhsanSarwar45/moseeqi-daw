import React, { Component } from 'react';
import MIDISounds from 'midi-sounds-react';

export class Sequencer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			piano: 15,
			tracks: [
				[
					true,
					false,
					false,
					false,
					false,
					false,
					false,
					true,
					true,
					false,
					true,
					false,
					false,
					false,
					true,
					false
				]
			]
		};
		this.state.data = [];
		this.beats = [];
	}
	componentDidMount() {
		this.setState({ initialized: true });
	}
	onSelectPiano(e) {
		var list = e.target;
		var n = list.options[list.selectedIndex].getAttribute('value');
		this.midiSounds.cacheInstrument(n);
		var me = this;
		this.midiSounds.player.loader.waitLoad(function() {
			me.setState({
				piano: n
			});
			me.fillBeat();
		});
	}
	createSelectItems() {
		if (this.midiSounds) {
			if (!this.items) {
				this.items = [];
				for (let i = 0; i < this.midiSounds.player.loader.instrumentKeys().length; i++) {
					this.items.push(
						<option key={i} value={i}>
							{'' + (i + 0) + '. ' + this.midiSounds.player.loader.instrumentInfo(i).title}
						</option>
					);
				}
			}
			return this.items;
		}
	}
	fillBeat() {
		for (var i = 0; i < 16; i++) {
			var instrument = [];
			if (this.state.tracks[0][i]) {
				instrument.push(this.state.piano);
			}
			var beat = [ instrument, [] ];
			this.beats[i] = beat;
		}
	}
	playLoop() {
		this.fillBeat();
		this.midiSounds.startPlayLoop(this.beats, 120, 1 / 16);
	}
	stopLoop() {
		this.midiSounds.stopPlayLoop();
	}
	togglePiano(track, step) {
		var a = this.state.tracks;
		a[track][step] = !a[track][step];
		this.setState({ tracks: a });
		this.fillBeat();
	}
	render() {
		return (
			<div className="App">
				<table align="center">
					<tbody>
						<tr>
							<td>
								<select value={this.state.piano} onChange={this.onSelectPiano.bind(this)}>
									{this.createSelectItems()}
								</select>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][0]}
									onChange={(e) => this.togglePiano(0, 0)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][1]}
									onChange={(e) => this.togglePiano(0, 1)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][2]}
									onChange={(e) => this.togglePiano(0, 2)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][3]}
									onChange={(e) => this.togglePiano(0, 3)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][4]}
									onChange={(e) => this.togglePiano(0, 4)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][5]}
									onChange={(e) => this.togglePiano(0, 5)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][6]}
									onChange={(e) => this.togglePiano(0, 6)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][7]}
									onChange={(e) => this.togglePiano(0, 7)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][8]}
									onChange={(e) => this.togglePiano(0, 8)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][9]}
									onChange={(e) => this.togglePiano(0, 9)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][10]}
									onChange={(e) => this.togglePiano(0, 10)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][11]}
									onChange={(e) => this.togglePiano(0, 11)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][12]}
									onChange={(e) => this.togglePiano(0, 12)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][13]}
									onChange={(e) => this.togglePiano(0, 13)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][14]}
									onChange={(e) => this.togglePiano(0, 14)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									defaultChecked={this.state.tracks[0][15]}
									onChange={(e) => this.togglePiano(0, 15)}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<p>
					<button onClick={this.playLoop.bind(this)}>Play loop</button>
					<button onClick={this.stopLoop.bind(this)}>Stop loop</button>
				</p>
				<p>Component</p>
				<MIDISounds
					ref={(ref) => (this.midiSounds = ref)}
					appElementName="root"
					instruments={[ this.state.piano ]}
				/>
				<hr />
				<p>
					Sources:{' '}
					<a href={'https://www.npmjs.com/package/midi-sounds-react'}>
						https://www.npmjs.com/package/midi-sounds-react
					</a>
				</p>
			</div>
		);
	}
}
