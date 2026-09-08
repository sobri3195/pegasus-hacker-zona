import unittest

from zona_engine import execute


class EngineTest(unittest.TestCase):
    def test_domain_workflow_is_structured(self):
        result = execute("domain", "Example.COM")
        self.assertEqual(result["target"], "example.com")
        self.assertEqual(result["status"], "complete")
        self.assertEqual(result["stages"][-1], "PROVENANCE")

    def test_ip_is_normalized(self):
        self.assertEqual(execute("ip", "2001:0db8::1")["target"], "2001:db8::1")

    def test_invalid_url_is_rejected(self):
        with self.assertRaises(ValueError):
            execute("url", "file:///etc/passwd")


if __name__ == "__main__":
    unittest.main()
