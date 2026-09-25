#!/bin/bash
sed -i '/<ParticleBackground \/>/a \      <AtmosphereAnimations \/>' src/components/StageLetter.tsx
sed -i 's/import { useConfig } from '\''..\/contexts\/ConfigContext'\'';/import { useConfig } from '\''..\/contexts\/ConfigContext'\'';\nimport { AtmosphereAnimations } from '.\/LetterAnimations';/' src/components/StageLetter.tsx
