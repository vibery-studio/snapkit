package layouts

import (
	"snapkit/engine"
	"snapkit/models"
)

// RenderFunc is the signature for built-in layout render functions
type RenderFunc func(p *engine.RenderParams) string

// BuiltinLayout holds metadata + render function for a built-in layout
type BuiltinLayout struct {
	Info   models.LayoutInfo
	Render RenderFunc
}

// Registry of all built-in layouts
var Registry = map[string]*BuiltinLayout{}

func register(l *BuiltinLayout) {
	Registry[l.Info.ID] = l
}

func init() {
	register(overlayCenter())
	register(splitLeft())
	register(splitRight())
	register(overlayBottom())
	register(cardCenter())
	register(textOnly())
	register(collage2())
	register(frame())
	register(agencySplit())
	register(brandShowcase())
}

// GetBuiltinIDs returns all built-in layout IDs
func GetBuiltinIDs() []string {
	ids := make([]string, 0, len(Registry))
	for id := range Registry {
		ids = append(ids, id)
	}
	return ids
}
