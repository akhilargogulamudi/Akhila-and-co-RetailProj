using Shop.Api;using Xunit;
namespace Shop.Tests;
public class PricingTests {
 [Theory][InlineData(10,5)][InlineData(74.99,5)][InlineData(75,0)][InlineData(100,0)]public void Shipping_threshold(decimal value,decimal expected)=>Assert.Equal(expected,Pricing.Shipping(value));
 [Fact]public void Empty_cart_rejected()=>Assert.Throws<ShopException>(()=>Pricing.Validate(new(Guid.NewGuid(),"Sample",[])));
 [Fact]public void Empty_name_rejected()=>Assert.Throws<ShopException>(()=>Pricing.Validate(new(Guid.NewGuid()," ",[new(1,1)])));
 [Fact]public void Duplicate_product_rejected()=>Assert.Throws<ShopException>(()=>Pricing.Validate(new(Guid.NewGuid(),"Sample",[new(1,1),new(1,2)])));
 [Theory][InlineData(0)][InlineData(-1)][InlineData(11)]public void Invalid_quantity_rejected(int q)=>Assert.Throws<ShopException>(()=>Pricing.Validate(new(Guid.NewGuid(),"Sample",[new(1,q)])));
 [Fact]public void Empty_request_id_rejected()=>Assert.Throws<ShopException>(()=>Pricing.Validate(new(Guid.Empty,"Sample",[new(1,1)])));
 [Fact]public void Null_cart_line_rejected()=>Assert.Throws<ShopException>(()=>Pricing.Validate(new(Guid.NewGuid(),"Sample",[null!])));
 [Fact]public void Stable_product_order()=>Assert.Equal(new[]{1,2},Pricing.Validate(new(Guid.NewGuid(),"Sample",[new(2,1),new(1,1)])).Select(x=>x.ProductId));
}
