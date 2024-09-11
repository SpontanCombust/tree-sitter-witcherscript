import XCTest
import SwiftTreeSitter
import TreeSitterWitcherscript

final class TreeSitterWitcherscriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_witcherscript())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Witcherscript grammar")
    }
}
