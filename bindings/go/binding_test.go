package tree_sitter_witcherscript_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_witcherscript "github.com/tree-sitter/tree-sitter-witcherscript/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_witcherscript.Language())
	if language == nil {
		t.Errorf("Error loading Witcherscript grammar")
	}
}
