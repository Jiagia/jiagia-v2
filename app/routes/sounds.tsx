import {useState} from 'react';
import {type MetaFunction} from 'react-router';

// Import MP3 files
import sound001mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_001.mp3';
import sound002mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_002.mp3';
import sound003mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_003.mp3';
import sound004mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_004.mp3';
import sound005mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_005.mp3';
import sound006mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_006.mp3';
import sound007mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_007.mp3';
import sound008mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_008.mp3';
import sound009mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_009.mp3';
import sound010mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_010.mp3';
import sound011mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_011.mp3';
import sound012mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_012.mp3';
import sound013mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_013.mp3';
import sound014mp3 from '~/assets/JIAGIA_WEBSITE_AUDIO/MP3/SOUND_014.mp3';

// Import WAV files
import sound001wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_001.wav';
import sound002wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_002.wav';
import sound003wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_003.wav';
import sound004wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_004.wav';
import sound005wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_005.wav';
import sound006wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_006.wav';
import sound007wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_007.wav';
import sound008wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_008.wav';
import sound009wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_009.wav';
import sound010wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_010.wav';
import sound011wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_011.wav';
import sound012wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_012.wav';
import sound013wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_013.wav';
import sound014wav from '~/assets/JIAGIA_WEBSITE_AUDIO/WAV/SOUND_014.wav';

export const meta: MetaFunction = () => {
  return [{title: 'Sounds Library | Jiagia Studios'}];
};

const mp3Sounds = [
  {id: 1, name: 'Sound 001', url: sound001mp3},
  {id: 2, name: 'Sound 002', url: sound002mp3},
  {id: 3, name: 'Sound 003', url: sound003mp3},
  {id: 4, name: 'Sound 004', url: sound004mp3},
  {id: 5, name: 'Sound 005', url: sound005mp3},
  {id: 6, name: 'Sound 006', url: sound006mp3},
  {id: 7, name: 'Sound 007', url: sound007mp3},
  {id: 8, name: 'Sound 008', url: sound008mp3},
  {id: 9, name: 'Sound 009', url: sound009mp3},
  {id: 10, name: 'Sound 010', url: sound010mp3},
  {id: 11, name: 'Sound 011', url: sound011mp3},
  {id: 12, name: 'Sound 012', url: sound012mp3},
  {id: 13, name: 'Sound 013', url: sound013mp3},
  {id: 14, name: 'Sound 014', url: sound014mp3},
];

const wavSounds = [
  {id: 1, name: 'Sound 001', url: sound001wav},
  {id: 2, name: 'Sound 002', url: sound002wav},
  {id: 3, name: 'Sound 003', url: sound003wav},
  {id: 4, name: 'Sound 004', url: sound004wav},
  {id: 5, name: 'Sound 005', url: sound005wav},
  {id: 6, name: 'Sound 006', url: sound006wav},
  {id: 7, name: 'Sound 007', url: sound007wav},
  {id: 8, name: 'Sound 008', url: sound008wav},
  {id: 9, name: 'Sound 009', url: sound009wav},
  {id: 10, name: 'Sound 010', url: sound010wav},
  {id: 11, name: 'Sound 011', url: sound011wav},
  {id: 12, name: 'Sound 012', url: sound012wav},
  {id: 13, name: 'Sound 013', url: sound013wav},
  {id: 14, name: 'Sound 014', url: sound014wav},
];

export default function Sounds() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{[key: string]: HTMLAudioElement}>({});

  const handlePlay = (soundId: string, url: string) => {
    // Stop currently playing sound if any
    if (currentlyPlaying && audioElements[currentlyPlaying]) {
      audioElements[currentlyPlaying].pause();
      audioElements[currentlyPlaying].currentTime = 0;
    }

    // If clicking the same sound that's playing, just stop it
    if (currentlyPlaying === soundId) {
      setCurrentlyPlaying(null);
      return;
    }

    // Create or get audio element
    let audio = audioElements[soundId];
    if (!audio) {
      audio = new Audio(url);
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      setAudioElements((prev) => ({...prev, [soundId]: audio}));
    }

    // Play new sound
    audio.play();
    setCurrentlyPlaying(soundId);
  };

  return (
    <div className="bg-black text-white min-h-screen py-12 md:py-20 -mt-8 md:-mt-12 lg:-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-32 xl:px-48">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 md:mb-20 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Sounds Library
            </h1>
            <p className="text-base md:text-lg text-gray-400">
              Explore our collection of audio samples
            </p>
          </div>

          {/* MP3 Section */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center border-b border-gray-700 pb-4">
              MP3 Files
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {mp3Sounds.map((sound) => {
                const soundId = `mp3-${sound.id}`;
                const isPlaying = currentlyPlaying === soundId;
                return (
                  <button
                    key={soundId}
                    onClick={() => handlePlay(soundId, sound.url)}
                    className={`
                      relative overflow-hidden
                      border-2 rounded-lg p-6 
                      transition-all duration-300 ease-in-out
                      hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50
                      ${
                        isPlaying
                          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                          : 'border-gray-700 bg-gray-900 hover:border-purple-400'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">
                        {isPlaying ? '⏸️' : '▶️'}
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">{sound.name}</div>
                        <div className="text-xs text-gray-400 mt-1">MP3</div>
                      </div>
                    </div>
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* WAV Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center border-b border-gray-700 pb-4">
              WAV Files
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {wavSounds.map((sound) => {
                const soundId = `wav-${sound.id}`;
                const isPlaying = currentlyPlaying === soundId;
                return (
                  <button
                    key={soundId}
                    onClick={() => handlePlay(soundId, sound.url)}
                    className={`
                      relative overflow-hidden
                      border-2 rounded-lg p-6 
                      transition-all duration-300 ease-in-out
                      hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50
                      ${
                        isPlaying
                          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50'
                          : 'border-gray-700 bg-gray-900 hover:border-blue-400'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">
                        {isPlaying ? '⏸️' : '▶️'}
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">{sound.name}</div>
                        <div className="text-xs text-gray-400 mt-1">WAV</div>
                      </div>
                    </div>
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

