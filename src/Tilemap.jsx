import { useApp, Container } from '@inlet/react-pixi'
import React, { useState, useEffect, useMemo } from 'react'
import tilemapMiddleware from './tilemapMiddleware'
import TilemapContext from './TilemapContext'
import Layer from './Layer'

const Tilemap = ({ tilemap, tilesets, children }) => {
    const app = useApp()
    const [map, setMap] = useState(null)

    const tileLayers = useMemo(() => 
        map?.layers.filter(layer => layer.type === 'tile'),
    [ map ])

    const layers = useMemo(() => {
        return tileLayers?.map((layer, index) => {
            const { name } = layer
            if (name === 'Foreground') {
                return children
            } else {
                return <Layer key={index} layer={layer} tilesets={tilesets} />
            }
        })
    }, [ tileLayers ])
 
    useEffect(() => {
        const existing = app.loader.resources[tilemap]

        if (existing) {
            setMap(existing.stage)
        } else {
            app.loader
                .add(tilemap)
                .use(tilemapMiddleware)
                .load((_, resources) => setMap(resources[tilemap].stage))
        }
    }, [ app.loader, tilemap ])

    useEffect(() => {
        if (children) {
            if (map?.layers.find(layer => layer.name === 'Foreground') === null) {
                throw new Error(`Tilemap ${tilemap} has children specified, but no 'Foreground' layer. You need a Foreground layer for the children to render.`)
            }
        }
    }, [ map ])

    // Only render once the map is loaded so that our hooks don't need to
    // conditionally check if anything in TilemapContext exists.
    if (map) {
        return <Container>
            <TilemapContext.Provider value={{ map, tileLayers }}>
                {layers}
            </TilemapContext.Provider>
        </Container>
    } else {
        return null
    }

}

export default Tilemap
